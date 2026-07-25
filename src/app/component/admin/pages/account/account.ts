import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AdminApiService } from '../../core/admin-api.service';
import { RoleCompte, Utilisateur } from '../../core/admin-api.types';
import { AuthService } from '../../core/auth.service';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';

/**
 * Écran Compte.
 *
 * Deux parties : son propre mot de passe, et — pour les administrateurs
 * seulement — la liste des comptes. Un éditeur ne voit jamais la seconde.
 *
 * Note : le contrat d'API ne décrit pas de route dédiée au changement de mot de
 * passe. On passe donc par `PATCH /api/admin/users/:id` avec un champ `password`
 * (voir le rapport de livraison). Si l'API ne l'accepte pas, l'erreur remontée
 * est affichée telle quelle, sans casser l'écran.
 */
@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SelectModule, PageHeader],
  templateUrl: './account.html'
})
export class AdminAccount {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);
  private readonly notif = inject(Notifications);

  readonly utilisateur = this.auth.utilisateur;
  readonly estAdmin = this.auth.estAdmin;

  // ── Mot de passe ──────────────────────────────────────────────────────────

  readonly nouveauMdp = signal('');
  readonly confirmationMdp = signal('');
  readonly changementEnCours = signal(false);

  readonly problemeMdp = computed(() => {
    const mdp = this.nouveauMdp();
    if (!mdp) return null;
    if (mdp.length < 12) return 'Choisissez au moins 12 caractères : c\'est la longueur qui protège.';
    if (this.confirmationMdp() && mdp !== this.confirmationMdp()) {
      return 'Les deux mots de passe saisis ne sont pas identiques.';
    }
    return null;
  });

  readonly peutChanger = computed(
    () =>
      !!this.nouveauMdp() &&
      this.nouveauMdp() === this.confirmationMdp() &&
      !this.problemeMdp()
  );

  async changerMotDePasse(): Promise<void> {
    const moi = this.utilisateur();
    if (!moi || !this.peutChanger()) return;

    this.changementEnCours.set(true);
    try {
      await this.api.utilisateurs.modifier(moi.id, {
        password: this.nouveauMdp()
      } as Partial<Utilisateur> & { password: string });
      this.nouveauMdp.set('');
      this.confirmationMdp.set('');
      this.notif.succes('Votre mot de passe a été changé.');
    } catch (err) {
      this.notif.erreur(err, 'changer le mot de passe');
    } finally {
      this.changementEnCours.set(false);
    }
  }

  // ── Gestion des comptes (ADMIN) ───────────────────────────────────────────

  readonly comptes = signal<Utilisateur[]>([]);
  readonly chargementComptes = signal(false);
  readonly dialogueCompte = signal(false);
  readonly nouvelEmail = signal('');
  readonly nouveauRole = signal<RoleCompte>('EDITOR');
  readonly nouveauMdpCompte = signal('');
  readonly creation = signal(false);

  readonly optionsRoles = [
    { label: 'Éditeur — peut tout modifier sauf les comptes', value: 'EDITOR' as RoleCompte },
    { label: 'Administrateur — peut aussi gérer les comptes', value: 'ADMIN' as RoleCompte }
  ];

  constructor() {
    if (this.auth.estAdmin()) void this.chargerComptes();
  }

  private async chargerComptes(): Promise<void> {
    this.chargementComptes.set(true);
    try {
      this.comptes.set(await this.api.utilisateurs.liste());
    } catch (err) {
      this.notif.erreur(err, 'charger la liste des comptes');
    } finally {
      this.chargementComptes.set(false);
    }
  }

  async creerCompte(): Promise<void> {
    const email = this.nouvelEmail().trim();
    if (!email || !this.nouveauMdpCompte()) {
      this.notif.avertissement('Renseignez une adresse e-mail et un mot de passe.');
      return;
    }
    if (this.nouveauMdpCompte().length < 12) {
      this.notif.avertissement('Le mot de passe doit faire au moins 12 caractères.');
      return;
    }

    this.creation.set(true);
    try {
      const compte = await this.api.utilisateurs.creer({
        email,
        role: this.nouveauRole(),
        password: this.nouveauMdpCompte()
      } as Partial<Utilisateur> & { password: string });
      this.comptes.set([...this.comptes(), compte]);
      this.dialogueCompte.set(false);
      this.nouvelEmail.set('');
      this.nouveauMdpCompte.set('');
      this.notif.succes(`Le compte ${email} a été créé.`);
    } catch (err) {
      this.notif.erreur(err, 'créer le compte');
    } finally {
      this.creation.set(false);
    }
  }

  supprimerCompte(compte: Utilisateur): void {
    if (compte.id === this.utilisateur()?.id) {
      this.notif.avertissement('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    this.notif.confirmerSuppression({
      quoi: `le compte ${compte.email}`,
      consequence: 'La personne perdra immédiatement l\'accès au panel. Cette action est définitive.',
      action: async () => {
        try {
          await this.api.utilisateurs.supprimer(compte.id);
          this.comptes.set(this.comptes().filter(c => c.id !== compte.id));
          this.notif.succes('Compte supprimé.');
        } catch (err) {
          this.notif.erreur(err, 'supprimer le compte');
        }
      }
    });
  }

  libelleRole(role: RoleCompte): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Éditeur';
  }
}
