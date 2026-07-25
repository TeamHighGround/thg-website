import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminHttp } from './admin-http';
import { Utilisateur } from './admin-api.types';

/**
 * Session du panel.
 *
 * RAPPEL IMPORTANT : rien ici ne protège quoi que ce soit. La session vit dans un
 * cookie `httpOnly` que le JavaScript ne peut pas lire ; ce service ne fait que
 * demander à l'API « qui suis-je ? » pour afficher le bon écran. La seule barrière
 * réelle est `requireAuth` côté Express.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(AdminHttp);

  /** `undefined` = pas encore vérifié, `null` = anonyme. */
  private readonly _utilisateur = signal<Utilisateur | null | undefined>(undefined);

  readonly utilisateur = this._utilisateur.asReadonly();
  readonly connecte = computed(() => !!this._utilisateur());
  readonly estAdmin = computed(() => this._utilisateur()?.role === 'ADMIN');

  /**
   * Interroge `GET /api/auth/me`. Le résultat est mis en cache : le guard est
   * appelé à chaque navigation, on ne veut pas une requête par clic.
   */
  async rafraichir(force = false): Promise<Utilisateur | null> {
    if (!force && this._utilisateur() !== undefined) return this._utilisateur()!;
    try {
      const reponse = await firstValueFrom(this.http.get<{ user: Utilisateur }>('/api/auth/me'));
      this._utilisateur.set(reponse.user);
      return reponse.user;
    } catch {
      this._utilisateur.set(null);
      return null;
    }
  }

  /** `POST /api/auth/login`. Laisse remonter l'erreur : l'écran affiche le message. */
  async connexion(email: string, motDePasse: string): Promise<Utilisateur> {
    this.http.marquerEcranConnexion(true);
    try {
      const reponse = await firstValueFrom(
        this.http.post<{ user: Utilisateur }>('/api/auth/login', { email, password: motDePasse })
      );
      this._utilisateur.set(reponse.user);
      return reponse.user;
    } finally {
      this.http.marquerEcranConnexion(false);
    }
  }

  /** `POST /api/auth/logout`. On oublie l'utilisateur même si l'appel échoue. */
  async deconnexion(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/logout', {}));
    } catch {
      /* l'important est de sortir : on ignore l'échec réseau */
    }
    this._utilisateur.set(null);
  }
}
