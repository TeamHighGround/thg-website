import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../../core/admin-api.service';
import { Equipe, Media, Membre, RoleJeu, TypeMembre } from '../../../core/admin-api.types';
import { PeutContenirDesModifications } from '../../../core/modifications-non-enregistrees.guard';
import { Notifications } from '../../../core/notifications.service';
import { ImageDrop } from '../../../shared/image-drop/image-drop';
import { I18nField } from '../../../shared/i18n-field/i18n-field';
import { PageHeader } from '../../../shared/page-header/page-header';
import { PublishToggle } from '../../../shared/publish-toggle/publish-toggle';
import { SaveBar } from '../../../shared/save-bar/save-bar';
import { SortableList } from '../../../shared/sortable-list/sortable-list';
import { MemberDialog } from '../member-dialog/member-dialog';

/**
 * Détail d'une équipe : sa fiche, puis ses joueurs et son staff.
 *
 * La fiche (nom, logo, visibilité) se sauvegarde via la barre du bas ; les
 * membres, eux, sont enregistrés à la fermeture de leur modale. Deux rythmes
 * différents, mais chacun explicite : on ne se demande jamais si c'est parti.
 */
@Component({
  selector: 'app-admin-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeader,
    ImageDrop,
    I18nField,
    PublishToggle,
    SaveBar,
    SortableList,
    MemberDialog
  ],
  templateUrl: './team-detail.html'
})
export class AdminTeamDetail implements PeutContenirDesModifications {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  /**
   * `withComponentInputBinding()` n'est pas activé sur le routeur de l'application
   * (et `app.config.ts` est hors périmètre) : on lit donc le paramètre de route
   * directement, plutôt que de le recevoir en entrée de composant.
   */
  private readonly route = inject(ActivatedRoute);
  readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly chargement = signal(true);
  readonly equipe = signal<Equipe | null>(null);
  readonly roles = signal<RoleJeu[]>([]);

  // Champs éditables de la fiche
  readonly nom = signal('');
  readonly descriptionFr = signal('');
  readonly descriptionEn = signal('');
  readonly logo = signal<Media | null>(null);
  readonly imageRoster = signal<Media | null>(null);
  readonly publie = signal(false);
  readonly enregistrement = signal(false);

  readonly joueurs = signal<Membre[]>([]);
  readonly staff = signal<Membre[]>([]);

  // Modale d'édition d'un membre
  readonly modaleOuverte = signal(false);
  readonly membreEnCours = signal<Membre | null>(null);
  readonly typeEnCours = signal<TypeMembre>('PLAYER');

  /** Signature de l'état enregistré, pour détecter les modifications. */
  private readonly reference = signal('');

  readonly etatCourant = computed(() =>
    JSON.stringify({
      nom: this.nom(),
      descriptionFr: this.descriptionFr(),
      descriptionEn: this.descriptionEn(),
      logo: this.logo()?.id ?? null,
      roster: this.imageRoster()?.id ?? null,
      publie: this.publie()
    })
  );

  readonly modifie = computed(() => !!this.reference() && this.etatCourant() !== this.reference());

  aDesModifications(): boolean {
    return this.modifie();
  }

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const [equipe, membres, roles] = await Promise.all([
        this.api.equipes.detail(this.id()),
        this.api.membres.liste(),
        this.api.roles.liste().catch(() => [] as RoleJeu[])
      ]);

      this.equipe.set(equipe);
      this.roles.set(roles);
      this.appliquer(equipe);

      // Le contrat ne prévoit pas de filtre serveur sur `members` : on trie ici.
      const duRoster = membres
        .filter(m => m.teamId === equipe.id)
        .sort((a, b) => a.order - b.order);
      this.joueurs.set(duRoster.filter(m => m.type === 'PLAYER'));
      this.staff.set(duRoster.filter(m => m.type === 'STAFF'));
    } catch (err) {
      this.notif.erreur(err, "charger l'équipe");
    } finally {
      this.chargement.set(false);
    }
  }

  private appliquer(equipe: Equipe): void {
    this.nom.set(equipe.name);
    this.descriptionFr.set(equipe.descriptionFr ?? '');
    this.descriptionEn.set(equipe.descriptionEn ?? '');
    this.logo.set(equipe.logo);
    this.imageRoster.set(equipe.rosterImage);
    this.publie.set(equipe.published);
    this.reference.set(this.etatCourant());
  }

  // ── Fiche de l'équipe ─────────────────────────────────────────────────────

  async enregistrer(): Promise<void> {
    const equipe = this.equipe();
    if (!equipe) return;
    if (!this.nom().trim()) {
      this.notif.avertissement("Le nom de l'équipe ne peut pas être vide.");
      return;
    }

    this.enregistrement.set(true);
    try {
      const maj = await this.api.equipes.modifier(equipe.id, {
        name: this.nom().trim(),
        // Chaîne vide → `null` : une description effacée doit disparaître du
        // site, pas y laisser un paragraphe vide.
        descriptionFr: this.descriptionFr().trim() || null,
        descriptionEn: this.descriptionEn().trim() || null,
        logoId: this.logo()?.id ?? null,
        rosterImageId: this.imageRoster()?.id ?? null,
        published: this.publie()
      });
      this.equipe.set(maj);
      this.appliquer(maj);
      this.notif.succes("Les informations de l'équipe sont enregistrées.");
    } catch (err) {
      this.notif.erreur(err, "enregistrer l'équipe");
    } finally {
      this.enregistrement.set(false);
    }
  }

  annuler(): void {
    const equipe = this.equipe();
    if (equipe) this.appliquer(equipe);
  }

  // ── Membres ───────────────────────────────────────────────────────────────

  ouvrirMembre(type: TypeMembre, membre: Membre | null, evenement?: Event): void {
    evenement?.preventDefault();
    evenement?.stopPropagation();
    this.typeEnCours.set(type);
    this.membreEnCours.set(membre);
    this.modaleOuverte.set(true);
  }

  surMembreEnregistre(membre: Membre): void {
    const liste = membre.type === 'STAFF' ? this.staff : this.joueurs;
    const existe = liste().some(m => m.id === membre.id);
    liste.set(existe ? liste().map(m => (m.id === membre.id ? membre : m)) : [...liste(), membre]);
  }

  supprimerMembre(membre: Membre, evenement: Event): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    const quoi = membre.type === 'STAFF' ? 'le membre du staff' : 'le joueur';
    this.notif.confirmerSuppression({
      quoi: `${quoi} ${membre.name}`,
      action: async () => {
        try {
          await this.api.membres.supprimer(membre.id);
          this.joueurs.set(this.joueurs().filter(m => m.id !== membre.id));
          this.staff.set(this.staff().filter(m => m.id !== membre.id));
          this.notif.succes(`${membre.name} a été retiré de l'équipe.`);
        } catch (err) {
          this.notif.erreur(err, 'supprimer la fiche');
        }
      }
    });
  }

  reordonnerMembres = (ids: string[]) => this.api.membres.reordonner(ids);

  nomRole(membre: Membre): string {
    if (membre.role?.labelFr) return membre.role.labelFr;
    return this.roles().find(r => r.id === membre.roleId)?.labelFr ?? 'Rôle non défini';
  }
}
