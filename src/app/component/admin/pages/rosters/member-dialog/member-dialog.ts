import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AdminApiService } from '../../../core/admin-api.service';
import { Media, Membre, ReseauxSociaux, RoleJeu, TypeMembre } from '../../../core/admin-api.types';
import { Notifications } from '../../../core/notifications.service';
import { ImageDrop } from '../../../shared/image-drop/image-drop';
import { PublishToggle } from '../../../shared/publish-toggle/publish-toggle';
import { RESEAUX_MEMBRE, SocialLinks } from '../../../shared/social-links/social-links';

/**
 * Fiche d'un joueur ou d'un membre du staff, en fenêtre modale.
 *
 * Une modale plutôt qu'une page : on ajoute rarement un joueur seul, on complète
 * un roster. Rester sur la liste derrière évite de perdre le fil.
 */
@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    SelectModule,
    ImageDrop,
    PublishToggle,
    SocialLinks
  ],
  templateUrl: './member-dialog.html'
})
export class MemberDialog {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly ouvert = model(false);
  /** Membre en cours d'édition, `null` pour une création. */
  readonly membre = input<Membre | null>(null);
  readonly teamId = input.required<string>();
  readonly type = input<TypeMembre>('PLAYER');
  readonly roles = input<RoleJeu[]>([]);

  /** Émis après enregistrement, avec le membre créé ou mis à jour. */
  readonly enregistre = output<Membre>();

  readonly reseauxMembre = RESEAUX_MEMBRE;

  readonly nom = signal('');
  readonly roleId = signal<string | null>(null);
  readonly image = signal<Media | null>(null);
  readonly publie = signal(true);
  readonly reseaux = signal<ReseauxSociaux>({});
  readonly enregistrement = signal(false);

  readonly estCreation = computed(() => !this.membre());
  readonly libelleType = computed(() => (this.type() === 'PLAYER' ? 'joueur' : 'membre du staff'));

  readonly optionsRoles = computed(() =>
    this.roles().map(r => ({ label: r.labelFr || r.key, value: r.id }))
  );

  constructor() {
    // Remplit le formulaire à chaque ouverture : on repart toujours de l'état réel.
    effect(() => {
      if (!this.ouvert()) return;
      const m = this.membre();
      this.nom.set(m?.name ?? '');
      this.roleId.set(m?.roleId ?? null);
      this.image.set(m?.image ?? null);
      this.publie.set(m?.published ?? true);
      this.reseaux.set({
        twitter: m?.twitter ?? null,
        twitch: m?.twitch ?? null,
        instagram: m?.instagram ?? null,
        youtube: m?.youtube ?? null,
        tiktok: m?.tiktok ?? null,
        lolpros: m?.lolpros ?? null
      });
    });
  }

  async valider(): Promise<void> {
    const nom = this.nom().trim();
    if (!nom) {
      this.notif.avertissement(`Indiquez le nom du ${this.libelleType()}.`);
      return;
    }

    const corps: Partial<Membre> = {
      teamId: this.teamId(),
      name: nom,
      roleId: this.roleId(),
      imageId: this.image()?.id ?? null,
      type: this.type(),
      published: this.publie(),
      ...(this.reseaux() as Partial<Membre>)
    };

    this.enregistrement.set(true);
    try {
      const existant = this.membre();
      const resultat = existant
        ? await this.api.membres.modifier(existant.id, corps)
        : await this.api.membres.creer(corps);
      this.enregistre.emit(resultat);
      this.ouvert.set(false);
      this.notif.succes(
        existant ? `${nom} a été mis à jour.` : `${nom} a été ajouté à l'équipe.`
      );
    } catch (err) {
      this.notif.erreur(err, 'enregistrer la fiche');
    } finally {
      this.enregistrement.set(false);
    }
  }
}
