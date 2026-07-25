/**
 * Fabrique un identifiant d'URL lisible à partir d'un titre.
 *
 * « Victoire à Lyon ! » → « victoire-a-lyon ». Les accents sont décomposés puis
 * les signes diacritiques (plage Unicode U+0300 à U+036F) retirés.
 *
 * Un slug n'est généré qu'à la CRÉATION : le modifier ensuite casserait les liens
 * déjà partagés vers la page.
 */
export function slugifier(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
