/**
 * Types du panel d'administration.
 *
 * ATTENTION : ces types sont volontairement DISTINCTS de ceux de `src/app/core/api/`.
 * Les routes publiques renvoient les textes déjà résolus dans une langue
 * (`title`), les routes `/api/admin/*` renvoient les champs bruts bilingues
 * (`titleFr` + `titleEn`). Ce sont deux formes différentes du même contenu :
 * la duplication est ici volontaire, pas un oubli.
 *
 * Référence : `docs/api-contract.md`.
 */

// ── Média ───────────────────────────────────────────────────────────────────

/** Objet média tel que renvoyé imbriqué dans les autres ressources. */
export interface Media {
  id: string;
  url: string;
  width: number;
  height: number;
  /** Texte alternatif résolu (routes publiques). Vide côté admin. */
  alt?: string;
  altFr?: string | null;
  altEn?: string | null;
}

/** Objet média étendu renvoyé par la médiathèque. */
export interface MediaItem extends Media {
  originalName: string;
  mime: string;
  sizeBytes: number;
  /** Nombre d'endroits du site où l'image est utilisée. */
  usageCount: number;
  createdAt: string;
}

// ── Authentification ────────────────────────────────────────────────────────

export type RoleCompte = 'ADMIN' | 'EDITOR';

export interface Utilisateur {
  id: string;
  email: string;
  role: RoleCompte;
  lastLoginAt?: string | null;
}

// ── Rosters ─────────────────────────────────────────────────────────────────

/** Rôle de jeu (Top, Jungle, Head Coach…), éditable en base. */
export interface RoleJeu {
  id: string;
  key: string;
  labelFr: string;
  labelEn: string;
  iconPath: string | null;
  colorClass: string | null;
  order: number;
}

export interface Jeu {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  order: number;
  published: boolean;
}

export interface Equipe {
  id: string;
  gameId: string;
  /** Slug du jeu, quand l'API le dénormalise dans la réponse. */
  gameSlug?: string;
  key: string;
  name: string;
  /** Présentation affichée sous le nom de l'équipe sur la page du jeu. */
  descriptionFr: string | null;
  descriptionEn: string | null;
  logo: Media | null;
  logoId?: string | null;
  rosterImage: Media | null;
  rosterImageId?: string | null;
  order: number;
  published: boolean;
}

export type TypeMembre = 'PLAYER' | 'STAFF';

/** Réseaux sociaux d'un membre ou d'un partenaire. */
export interface ReseauxSociaux {
  twitter?: string | null;
  twitch?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  lolpros?: string | null;
  soundcloud?: string | null;
  website?: string | null;
  discord?: string | null;
}

export interface Membre extends ReseauxSociaux {
  id: string;
  teamId: string;
  name: string;
  roleId: string | null;
  role?: RoleJeu | null;
  image: Media | null;
  imageId?: string | null;
  type: TypeMembre;
  order: number;
  published?: boolean;
}

// ── Timeline ────────────────────────────────────────────────────────────────

export interface Chapitre {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  order: number;
  published: boolean;
}

export interface Jalon {
  id: string;
  chapterId: string;
  slug: string;
  dateLabelFr: string;
  dateLabelEn: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  resultFr: string | null;
  resultEn: string | null;
  image: Media | null;
  imageId?: string | null;
  roster: string[];
  hasBadge: boolean;
  order: number;
  published: boolean;
}

// ── Partenaires & ambassadeurs ──────────────────────────────────────────────

export type TypePartenaire = 'PARTNER' | 'AMBASSADOR';

export interface ImagePartenaire {
  id: string;
  mediaId: string;
  media: Media | null;
  order: number;
}

export interface Partenaire extends ReseauxSociaux {
  id: string;
  kind: TypePartenaire;
  name: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  typesFr: string[];
  typesEn: string[];
  images: ImagePartenaire[];
  order: number;
  published: boolean;
}

// Les actualités ne sont plus administrables depuis le panel : les types et
// l'accès CRUD associés ont été retirés. Les routes `/api/admin/news` existent
// toujours côté API, elles ne sont simplement plus utilisées ici.

// ── Enveloppe d'erreur du contrat ───────────────────────────────────────────

export interface ErreurApi {
  error: {
    code: string;
    message: string;
    details?: { field?: string; message: string }[];
  };
}

// ── Réglages du site ────────────────────────────────────────────────────────

/** `GET /api/admin/settings` — réseaux sociaux de l'association et boutique. */
export interface ReglagesSite {
  twitter: string | null;
  instagram: string | null;
  discord: string | null;
  shopEnabled: boolean;
  shopUrl: string | null;
  updatedAt?: string;
}
