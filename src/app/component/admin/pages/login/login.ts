import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { messageErreur } from '../../core/admin-erreurs';

/**
 * Écran de connexion au panel.
 *
 * Le message d'échec est volontairement unique et neutre : « Email ou mot de
 * passe incorrect. » Distinguer les deux cas révélerait quels comptes existent.
 */
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);

  readonly email = signal('');
  readonly motDePasse = signal('');
  readonly motDePasseVisible = signal(false);
  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);

  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  async valider(): Promise<void> {
    if (this.enCours()) return;
    this.erreur.set(null);

    const email = this.email().trim();
    if (!email || !this.motDePasse()) {
      this.erreur.set('Renseignez votre adresse e-mail et votre mot de passe.');
      return;
    }

    this.enCours.set(true);
    try {
      await this.auth.connexion(email, this.motDePasse());
      const retour = this.route.snapshot.queryParamMap.get('retour');
      // On ne suit que les destinations internes au panel : un `retour` fabriqué
      // dans l'URL ne doit pas pouvoir renvoyer ailleurs.
      const destination = retour?.startsWith('/admin') ? retour : '/admin';
      await this.router.navigateByUrl(destination);
    } catch (err) {
      this.erreur.set(messageErreur(err, 'vous connecter'));
      this.motDePasse.set('');
    } finally {
      this.enCours.set(false);
    }
  }
}
