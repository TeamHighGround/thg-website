import { SocialLinks } from '../../component/shared/social-links/social-links.interface';

/**
 * Modèles TypeScript des réponses publiques de l'API THG.
 *
 * Ces types recopient à l'identique les formes JSON figées dans
 * `docs/api-contract.md`. Toute divergence est un bug : le contrat fait foi.
 *
 * Rappel de deux conventions du contrat :
 * - les routes publiques renvoient les textes DÉJÀ résolus dans la langue
 *   demandée (`?lang=fr|en`) : aucun suffixe `Fr`/`En` ne remonte jamais ici ;
 * - un champ média absent vaut `null`, jamais `undefined`.
 */

/** Image servie par l'API sous `/media/<filename>`. */
export interface Media {
  id: string;
  url: string;
  /** Largeur intrinsèque, déduite à l'upload. Sert à réserver l'espace. */
  width: number;
  /** Hauteur intrinsèque, déduite à l'upload. Sert à réserver l'espace. */
  height: number;
  /** Texte alternatif, résolu selon `lang`. */
  alt: string;
}

// ── Équipes ───────────────────────────────────────────────────────────────────

/** Jeu auquel une liste d'équipes se rattache. */
export interface Game {
  slug: string;
  name: string;
}

/**
 * Rôle d'un membre d'équipe. Remplace les maps `getRoleIcon` / `getRoleColor`
 * qui étaient codées en dur dans `lol.ts`.
 */
export interface Role {
  key: string;
  label: string;
  /** Chemin d'icône (`assets/...svg`) ou classe PrimeIcons (`pi-briefcase`). */
  iconPath: string;
  colorClass: string;
}

/** Joueur ou membre du staff. */
export interface TeamMember {
  id: string;
  name: string;
  /** Correspond à `Role.key`. */
  role: string;
  image: Media | null;
  socialLinks?: SocialLinks;
}

export interface Team {
  id: string;
  key: string;
  name: string;
  /** Texte de présentation, résolu dans la langue demandée. */
  description: string | null;
  logo: Media | null;
  rosterImage: Media | null;
  players: TeamMember[];
  staff: TeamMember[];
}

/** `GET /api/teams?game=<slug>&lang=<lang>` */
export interface TeamsResponse {
  game: Game;
  roles: Role[];
  teams: Team[];
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export interface TimelineMilestone {
  id: string;
  slug: string;
  dateLabel: string;
  title: string;
  description: string;
  /** Non-`null` remplace l'ancien booléen `hasResult`. */
  result: string | null;
  image: Media | null;
  roster: string[];
  hasBadge: boolean;
}

export interface TimelineChapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  milestones: TimelineMilestone[];
}

/** `GET /api/timeline?lang=<lang>` */
export interface TimelineResponse {
  chapters: TimelineChapter[];
}

// ── Partenaires & ambassadeurs ────────────────────────────────────────────────

/** Nature d'une entrée : partenaire de l'association ou ambassadeur. */
export type PartnerKind = 'partner' | 'ambassador';

export interface PartnerEntry {
  id: string;
  name: string;
  types: string[];
  description: string;
  images: Media[];
  socialMedia?: SocialLinks;
}

/** `GET /api/partners?kind=<kind>&lang=<lang>` */
export interface PartnersResponse {
  entries: PartnerEntry[];
}

// ── Actualités ────────────────────────────────────────────────────────────────

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: Media | null;
  /** Date ISO 8601. */
  publishedAt: string;
}

/** `GET /api/news/:slug` — identique à `NewsPost` plus le corps en markdown. */
export interface NewsPostDetail extends NewsPost {
  body: string;
}

/** `GET /api/news?lang=<lang>&page=<n>&pageSize=<n>` */
export interface NewsListResponse {
  items: NewsPost[];
  page: number;
  pageSize: number;
  total: number;
}

// ── Réglages du site ──────────────────────────────────────────────────────────

/** Réseaux sociaux de l'association. Une clé absente = réseau non renseigné. */
export interface SiteSocialLinks {
  twitter?: string;
  instagram?: string;
  discord?: string;
}

/** Boutique HelloAsso. `url` ne vaut une adresse que boutique ouverte. */
export interface SiteShop {
  enabled: boolean;
  url: string | null;
}

/** `GET /api/settings` */
export interface SiteSettingsResponse {
  socialLinks: SiteSocialLinks;
  /** Adresse de contact de l'association, `null` si non renseignée. */
  contactEmail: string | null;
  shop: SiteShop;
}

// ── Recrutement (page « Nous rejoindre ») ─────────────────────────────────────

/**
 * `opening` : besoin ponctuel (bloc « On recrute ») ·
 * `always_open` : candidatures acceptées toute l'année, même effectif complet.
 */
export type JobCategory = 'opening' | 'always_open';

/** Jeux pratiqués par le club. */
export type JobGame = 'lol' | 'tft' | 'ssbu';

export interface JobOpening {
  id: string;
  category: JobCategory;
  games: JobGame[];
  title: string;
  summary: string | null;
  description: string | null;
  /** Une phrase par élément ; vide si non renseigné. */
  missions: string[];
  profile: string[];
  tags: string[];
  /** Formulaire de candidature ; `null` → le site propose l'e-mail de contact. */
  applyUrl: string | null;
}

/** `GET /api/jobs?lang=<lang>` */
export interface JobsResponse {
  openings: JobOpening[];
}

// ── Erreurs ───────────────────────────────────────────────────────────────────

/** Corps d'erreur commun à toutes les routes de l'API. */
export interface ApiErrorBody {
  error: {
    code: string;
    /** En français, lisible par un humain : affichable tel quel. */
    message: string;
    details?: { field: string; message: string }[];
  };
}
