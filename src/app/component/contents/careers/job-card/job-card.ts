import { Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { JobGame, JobOpening } from '../../../../core/api/models';

/** Libellé court et couleur de pastille de chaque jeu (classes écrites en entier pour Tailwind). */
const JEUX: Record<JobGame, { libelle: string; classes: string }> = {
  lol: { libelle: 'League of Legends', classes: 'bg-sky-500/10 text-sky-300 border-sky-400/30' },
  tft: { libelle: 'Teamfight Tactics', classes: 'bg-violet-500/10 text-violet-300 border-violet-400/30' },
  ssbu: { libelle: 'Smash Bros. Ultimate', classes: 'bg-rose-500/10 text-rose-300 border-rose-400/30' }
};

/**
 * Carte d'un poste ouvert.
 *
 * Le détail (description, missions, profil) se replie dans un `<details>` natif :
 * aucun état côté composant, donc rien à réconcilier à l'hydratation, et le
 * contenu reste dans le HTML rendu par le serveur pour le référencement.
 */
@Component({
  selector: 'app-job-card',
  imports: [TranslocoModule],
  templateUrl: './job-card.html',
  styles: `
    :host { display: block; }
    .job-details > summary { list-style: none; }
    .job-details > summary::-webkit-details-marker { display: none; }
    .job-details[open] .job-details-chevron { transform: rotate(180deg); }
  `
})
export class JobCard {
  readonly job = input.required<JobOpening>();
  /** Adresse de contact, utilisée quand le poste n'a pas de formulaire dédié. */
  readonly email = input<string | null>(null);
  /** Tuile resserrée, pour les candidatures permanentes affichées par jeu. */
  readonly compact = input(false);

  readonly jeux = computed(() => this.job().games.map(jeu => JEUX[jeu]).filter(Boolean));

  readonly aDuDetail = computed(() => {
    const job = this.job();
    return !!job.description || job.missions.length > 0 || job.profile.length > 0;
  });

  /** Formulaire du poste, sinon un e-mail pré-rempli avec l'intitulé en objet. */
  readonly lienCandidature = computed(() => {
    const job = this.job();
    if (job.applyUrl) return job.applyUrl;
    const email = this.email();
    if (!email) return null;
    return `mailto:${email}?subject=${encodeURIComponent(`Candidature — ${job.title}`)}`;
  });

  readonly lienExterne = computed(() => !!this.job().applyUrl);
}
