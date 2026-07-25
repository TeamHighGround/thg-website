import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AdminApiService } from '../../core/admin-api.service';
import { Equipe, Jeu } from '../../core/admin-api.types';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';
import { SortableList } from '../../shared/sortable-list/sortable-list';

/**
 * Jeux connus du site, utilisés comme repli si l'API n'expose pas de route
 * `/api/admin/games` (elle n'est pas listée dans le contrat — voir le rapport).
 * Les libellés servent uniquement à l'affichage du panel.
 */
const JEUX_CONNUS: { slug: string; libelle: string; page: string }[] = [
  { slug: 'lol', libelle: 'League of Legends', page: '/teams/lol' },
  { slug: 'tft', libelle: 'Teamfight Tactics', page: '/teams/tft' },
  { slug: 'ssbu', libelle: 'Super Smash Bros. Ultimate', page: '/teams/ssbu' }
];

interface GroupeJeu {
  slug: string;
  libelle: string;
  page: string;
  equipes: Equipe[];
}

/**
 * Écran Rosters : les jeux, puis les équipes de chaque jeu.
 *
 * Le détail d'une équipe (joueurs, staff) vit dans un écran dédié : mélanger les
 * deux niveaux sur une seule page rendrait le tri incompréhensible.
 */
@Component({
  selector: 'app-admin-rosters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DialogModule,
    SelectModule,
    PageHeader,
    SortableList
  ],
  templateUrl: './rosters.html'
})
export class AdminRosters {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly chargement = signal(true);
  readonly equipes = signal<Equipe[]>([]);
  readonly jeux = signal<Jeu[]>([]);

  /** Équipes regroupées par jeu, dans l'ordre d'affichage du site. */
  readonly groupes = computed<GroupeJeu[]>(() => {
    const parSlug = new Map<string, Equipe[]>();
    for (const equipe of this.equipes()) {
      const cle = this.slugDuJeu(equipe);
      if (!parSlug.has(cle)) parSlug.set(cle, []);
      parSlug.get(cle)!.push(equipe);
    }

    return JEUX_CONNUS.map(jeu => ({
      ...jeu,
      libelle: this.jeux().find(j => j.slug === jeu.slug)?.nameFr ?? jeu.libelle,
      equipes: (parSlug.get(jeu.slug) ?? []).sort((a, b) => a.order - b.order)
    }));
  });

  // ── Création d'une équipe ─────────────────────────────────────────────────

  readonly dialogueOuvert = signal(false);
  readonly nouveauNom = signal('');
  readonly nouveauJeu = signal<string | null>(null);
  readonly creation = signal(false);
  readonly optionsJeux = computed(() =>
    this.groupes().map(g => ({ label: g.libelle, value: g.slug }))
  );

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      // La route des jeux n'est pas au contrat : son absence ne doit pas casser
      // l'écran, on retombe alors sur les libellés connus.
      const [equipes, jeux] = await Promise.all([
        this.api.equipes.liste(),
        this.api.jeux.liste().catch(() => [] as Jeu[])
      ]);
      this.equipes.set(equipes);
      this.jeux.set(jeux);
    } catch (err) {
      this.notif.erreur(err, 'charger les équipes');
    } finally {
      this.chargement.set(false);
    }
  }

  slugDuJeu(equipe: Equipe): string {
    if (equipe.gameSlug) return equipe.gameSlug;
    const jeu = this.jeux().find(j => j.id === equipe.gameId);
    return jeu?.slug ?? 'lol';
  }

  /** Réordonnancement limité aux équipes d'un même jeu (même parent, cf. contrat). */
  reordonnerEquipes = (ids: string[]) => this.api.equipes.reordonner(ids);

  majGroupe(slug: string, equipes: Equipe[]): void {
    const autres = this.equipes().filter(e => this.slugDuJeu(e) !== slug);
    this.equipes.set([...autres, ...equipes.map((e, i) => ({ ...e, order: i }))]);
  }

  ouvrirCreation(slug?: string): void {
    this.nouveauNom.set('');
    this.nouveauJeu.set(slug ?? this.groupes()[0]?.slug ?? null);
    this.dialogueOuvert.set(true);
  }

  async creer(): Promise<void> {
    const nom = this.nouveauNom().trim();
    const slug = this.nouveauJeu();
    if (!nom || !slug) {
      this.notif.avertissement("Donnez un nom à l'équipe et choisissez un jeu.");
      return;
    }

    this.creation.set(true);
    try {
      const jeu = this.jeux().find(j => j.slug === slug);
      const equipe = await this.api.equipes.creer({
        name: nom,
        key: nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        gameId: jeu?.id,
        gameSlug: slug,
        published: false
      } as Partial<Equipe>);
      this.equipes.set([...this.equipes(), equipe]);
      this.dialogueOuvert.set(false);
      this.notif.succes(
        `L'équipe « ${nom} » est créée, en brouillon. Ajoutez ses joueurs, puis rendez-la visible.`
      );
    } catch (err) {
      this.notif.erreur(err, "créer l'équipe");
    } finally {
      this.creation.set(false);
    }
  }

  supprimer(equipe: Equipe, evenement: Event): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    this.notif.confirmerSuppression({
      quoi: `l'équipe ${equipe.name}`,
      consequence: 'Ses joueurs et son staff seront supprimés avec elle. Cette action est définitive.',
      action: async () => {
        try {
          await this.api.equipes.supprimer(equipe.id);
          this.equipes.set(this.equipes().filter(e => e.id !== equipe.id));
          this.notif.succes(`L'équipe ${equipe.name} a été supprimée.`);
        } catch (err) {
          this.notif.erreur(err, "supprimer l'équipe");
        }
      }
    });
  }
}
