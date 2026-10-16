import { HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { AdminHttp } from './admin-http';
import {
  Chapitre,
  Equipe,
  Jalon,
  Jeu,
  Media,
  MediaItem,
  Membre,
  Partenaire,
  ReglagesSite,
  RoleJeu,
  Utilisateur
} from './admin-api.types';

/** Progression d'un envoi de fichier, consommée par `<app-image-drop>`. */
export type EtatEnvoi =
  | { statut: 'progression'; pourcentage: number }
  | { statut: 'termine'; media: MediaItem };

/**
 * Accès aux routes `/api/admin/*`.
 *
 * Le contrat impose le même schéma CRUD pour chaque ressource (liste, détail,
 * création, mise à jour partielle, suppression, réordonnancement). On l'écrit une
 * fois dans `ressource()` et chaque entité en hérite : moins de code, et surtout
 * aucune chance qu'une ressource dévie du contrat par inadvertance.
 */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(AdminHttp);

  // ── Fabrique CRUD générique ───────────────────────────────────────────────

  private ressource<T>(chemin: string) {
    const base = `/api/admin/${chemin}`;
    return {
      /**
       * Liste complète : publiés ET brouillons, champs bruts bilingues.
       *
       * **Toutes** les routes de liste admin enveloppent leur résultat dans
       * `{ items: [...] }`. On déballe ici plutôt que dans chaque écran : sinon
       * chaque `@for` reçoit un objet non itérable et l'écran reste vide.
       * La tolérance au tableau nu couvre une éventuelle route qui n'envelopperait
       * pas.
       */
      liste: async (params?: Record<string, string | number | boolean>): Promise<T[]> => {
        const reponse = await firstValueFrom(
          this.http.get<T[] | { items: T[] }>(base, params)
        );
        return Array.isArray(reponse) ? reponse : (reponse?.items ?? []);
      },
      detail: (id: string) => firstValueFrom(this.http.get<T>(`${base}/${id}`)),
      creer: (corps: Partial<T>) => firstValueFrom(this.http.post<T>(base, corps)),
      modifier: (id: string, corps: Partial<T>) =>
        firstValueFrom(this.http.patch<T>(`${base}/${id}`, corps)),
      supprimer: (id: string) => firstValueFrom(this.http.delete<void>(`${base}/${id}`)),
      /**
       * Réordonnancement : une seule requête par déplacement, le serveur réécrit
       * les `order` dans une transaction. Tous les ids doivent avoir le même parent.
       */
      reordonner: (ids: string[]) =>
        firstValueFrom(this.http.patch<void>(`${base}/reorder`, { ids }))
    };
  }

  // ── Ressources ────────────────────────────────────────────────────────────

  readonly jeux = this.ressource<Jeu>('games');
  readonly equipes = this.ressource<Equipe>('teams');
  readonly membres = this.ressource<Membre>('members');
  readonly roles = this.ressource<RoleJeu>('roles');
  readonly chapitres = this.ressource<Chapitre>('timeline/chapters');
  readonly jalons = this.ressource<Jalon>('timeline/milestones');
  readonly partenaires = this.ressource<Partenaire>('partners');
  readonly utilisateurs = this.ressource<Utilisateur>('users');

  // ── Réglages du site ──────────────────────────────────────────────────────

  /** `GET /api/admin/settings` — ligne unique, pas d'enveloppe. */
  reglages() {
    return firstValueFrom(this.http.get<ReglagesSite>('/api/admin/settings'));
  }

  /** `PATCH /api/admin/settings` — mise à jour partielle. */
  modifierReglages(corps: Partial<ReglagesSite>) {
    return firstValueFrom(this.http.patch<ReglagesSite>('/api/admin/settings', corps));
  }

  // ── Médiathèque ───────────────────────────────────────────────────────────

  /** `GET /api/admin/media` — enveloppée dans `{ items }`, comme les autres listes. */
  async listeMedias(): Promise<MediaItem[]> {
    const reponse = await firstValueFrom(
      this.http.get<{ items: MediaItem[] }>('/api/admin/media')
    );
    return reponse.items ?? [];
  }

  /**
   * `POST /api/admin/media/upload` — multipart, champ `file` (imposé par le contrat).
   * Émet la progression puis le média créé.
   */
  envoyerImage(fichier: File): Observable<EtatEnvoi> {
    const formulaire = new FormData();
    formulaire.append('file', fichier, fichier.name);

    return this.http.televerser<MediaItem>('/api/admin/media/upload', formulaire).pipe(
      map(evenement => {
        if (evenement.type === HttpEventType.UploadProgress) {
          const total = evenement.total ?? fichier.size;
          return {
            statut: 'progression' as const,
            // Plafonné à 99 % : les 100 % sont annoncés quand le serveur a répondu,
            // pas quand le dernier octet est parti.
            pourcentage: Math.min(99, Math.round((evenement.loaded / total) * 100))
          };
        }
        if (evenement.type === HttpEventType.Response) {
          return { statut: 'termine' as const, media: evenement.body as MediaItem };
        }
        return { statut: 'progression' as const, pourcentage: 0 };
      })
    );
  }

  /** Modifie les textes alternatifs d'un média. */
  modifierMedia(id: string, corps: { altFr?: string | null; altEn?: string | null }) {
    return firstValueFrom(this.http.patch<Media>(`/api/admin/media/${id}`, corps));
  }

  /** Supprime un média. L'API répond `409` si l'image est encore utilisée. */
  supprimerMedia(id: string) {
    return firstValueFrom(this.http.delete<void>(`/api/admin/media/${id}`));
  }
}
