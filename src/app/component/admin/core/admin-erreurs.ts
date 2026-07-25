import { HttpErrorResponse } from '@angular/common/http';
import { ErreurApi } from './admin-api.types';

/**
 * Traduit n'importe quelle erreur HTTP en une phrase française lisible.
 *
 * Règle du panel : l'utilisateur ne voit JAMAIS « 500 Internal Server Error ».
 * L'API renvoie déjà un `error.message` en français (cf. contrat) ; on l'affiche
 * tel quel. Les cas restants (réseau coupé, API éteinte) sont rattrapés ici.
 */
export function messageErreur(err: unknown, contexte?: string): string {
  if (err instanceof HttpErrorResponse) {
    // Message fourni par l'API : c'est le meilleur, il est déjà rédigé pour l'humain.
    const corps = err.error as ErreurApi | string | null;
    if (corps && typeof corps === 'object' && corps.error?.message) {
      return corps.error.message;
    }

    // Statut 0 : la requête n'a même pas abouti.
    if (err.status === 0) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion, puis réessayez.";
    }

    switch (err.status) {
      case 400:
        return "Certaines informations sont incomplètes ou mal remplies.";
      case 401:
        return "Votre session a expiré. Reconnectez-vous.";
      case 403:
        return "Votre compte n'a pas les droits nécessaires pour cette action.";
      case 404:
        return "Cet élément n'existe plus. Il a peut-être été supprimé entre-temps.";
      case 409:
        return "Cette action entre en conflit avec des données existantes.";
      case 413:
        return "Le fichier est trop lourd. La limite est de 10 Mo.";
      case 415:
        return "Ce type de fichier n'est pas accepté. Utilisez une image JPG, PNG, WebP ou AVIF.";
      case 429:
        return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
      default:
        return contexte
          ? `Le serveur n'a pas pu ${contexte}. Réessayez dans un instant.`
          : "Le serveur a rencontré un problème. Réessayez dans un instant.";
    }
  }

  if (err instanceof Error && err.message) return err.message;
  return "Une erreur inattendue s'est produite.";
}

/**
 * Détail champ par champ, quand l'API en fournit.
 * Sert à surligner les champs fautifs dans un formulaire.
 */
export function detailsErreur(err: unknown): Record<string, string> {
  const sortie: Record<string, string> = {};
  if (err instanceof HttpErrorResponse) {
    const corps = err.error as ErreurApi | null;
    for (const d of corps?.error?.details ?? []) {
      if (d.field) sortie[d.field] = d.message;
    }
  }
  return sortie;
}

/** Formate une taille en octets pour un message lisible : « 14 Mo ». */
export function tailleLisible(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}
