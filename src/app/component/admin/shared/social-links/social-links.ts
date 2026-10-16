import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReseauxSociaux } from '../../core/admin-api.types';

interface DefinitionReseau {
  cle: keyof ReseauxSociaux;
  libelle: string;
  icone: string;
  exemple: string;
}

/** Réseaux disponibles pour un membre d'équipe. */
export const RESEAUX_MEMBRE: DefinitionReseau[] = [
  { cle: 'twitter', libelle: 'X (Twitter)', icone: 'pi-twitter', exemple: 'https://x.com/pseudo' },
  { cle: 'twitch', libelle: 'Twitch', icone: 'pi-video', exemple: 'https://twitch.tv/pseudo' },
  { cle: 'instagram', libelle: 'Instagram', icone: 'pi-instagram', exemple: 'https://instagram.com/pseudo' },
  { cle: 'youtube', libelle: 'YouTube', icone: 'pi-youtube', exemple: 'https://youtube.com/@pseudo' },
  { cle: 'tiktok', libelle: 'TikTok', icone: 'pi-hashtag', exemple: 'https://tiktok.com/@pseudo' },
  { cle: 'lolpros', libelle: 'LoLPros', icone: 'pi-chart-line', exemple: 'https://lolpros.gg/player/pseudo' }
];

/** Réseaux disponibles pour un partenaire ou un ambassadeur. */
export const RESEAUX_PARTENAIRE: DefinitionReseau[] = [
  { cle: 'website', libelle: 'Site web', icone: 'pi-globe', exemple: 'https://exemple.fr' },
  { cle: 'instagram', libelle: 'Instagram', icone: 'pi-instagram', exemple: 'https://instagram.com/pseudo' },
  { cle: 'twitter', libelle: 'X (Twitter)', icone: 'pi-twitter', exemple: 'https://x.com/pseudo' },
  { cle: 'twitch', libelle: 'Twitch', icone: 'pi-video', exemple: 'https://twitch.tv/pseudo' },
  { cle: 'youtube', libelle: 'YouTube', icone: 'pi-youtube', exemple: 'https://youtube.com/@pseudo' },
  { cle: 'tiktok', libelle: 'TikTok', icone: 'pi-hashtag', exemple: 'https://tiktok.com/@pseudo' },
  { cle: 'soundcloud', libelle: 'SoundCloud', icone: 'pi-volume-up', exemple: 'https://soundcloud.com/pseudo' }
];

/** Réseaux de l'association, affichés dans le footer et la page contact. */
export const RESEAUX_SITE: DefinitionReseau[] = [
  { cle: 'twitter', libelle: 'X (Twitter)', icone: 'pi-twitter', exemple: 'https://x.com/teamhigh_ground' },
  { cle: 'instagram', libelle: 'Instagram', icone: 'pi-instagram', exemple: 'https://instagram.com/pseudo' },
  { cle: 'discord', libelle: 'Discord', icone: 'pi-discord', exemple: 'https://discord.gg/invitation' }
];

/**
 * Bloc « réseaux sociaux ».
 *
 * Chaque ligne attend une adresse complète. La validation est immédiate et
 * explicite : on ne laisse pas quelqu'un enregistrer « @pseudo » en croyant que
 * ça marchera, on lui dit tout de suite qu'il manque `https://`.
 */
@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './social-links.html'
})
export class SocialLinks {
  /** Objet portant les clés de réseaux ; muté par référence à chaque saisie. */
  readonly valeurs = model.required<ReseauxSociaux>();
  /** Liste des réseaux proposés (membre ou partenaire). */
  readonly reseaux = input<DefinitionReseau[]>(RESEAUX_MEMBRE);

  lire(cle: keyof ReseauxSociaux): string {
    return (this.valeurs()[cle] as string | null | undefined) ?? '';
  }

  ecrire(cle: keyof ReseauxSociaux, valeur: string): void {
    // Une adresse vide est envoyée à `null` : le contrat précise que les clés
    // nulles sont omises des réponses publiques.
    this.valeurs.set({ ...this.valeurs(), [cle]: valeur.trim() || null });
  }

  /** Retourne un message d'erreur, ou `null` si l'adresse est correcte. */
  erreur(cle: keyof ReseauxSociaux): string | null {
    const valeur = this.lire(cle).trim();
    if (!valeur) return null;
    if (!/^https?:\/\//i.test(valeur)) {
      return "L'adresse doit commencer par https://";
    }
    try {
      new URL(valeur);
      return null;
    } catch {
      return "Cette adresse n'est pas valide.";
    }
  }

  /** Vrai si au moins une adresse est mal formée : bloque l'enregistrement. */
  auMoinsUneErreur(): boolean {
    return this.reseaux().some(r => this.erreur(r.cle) !== null);
  }
}
