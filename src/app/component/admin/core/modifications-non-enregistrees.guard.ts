import { CanDeactivateFn } from '@angular/router';

/**
 * Contrat que remplit tout écran d'édition du panel.
 * Le guard ne connaît rien du formulaire : il demande juste « as-tu des
 * modifications en cours ? ».
 */
export interface PeutContenirDesModifications {
  aDesModifications(): boolean;
}

/**
 * Empêche de perdre son travail en quittant une page d'édition.
 *
 * Une simple `confirm()` native : c'est le seul dialogue qui fonctionne aussi
 * pour le bouton « précédent » du navigateur, et il est instantanément compris.
 */
export const gardeModificationsNonEnregistrees: CanDeactivateFn<
  PeutContenirDesModifications
> = composant => {
  if (!composant?.aDesModifications?.()) return true;
  // `confirm` n'existe pas au rendu serveur ; ces écrans sont en rendu client,
  // mais la vérification garde le code sûr en toute circonstance.
  if (typeof window === 'undefined') return true;
  return window.confirm(
    'Vous avez des modifications non enregistrées.\n\nSi vous quittez cette page maintenant, elles seront perdues.\n\nQuitter quand même ?'
  );
};
