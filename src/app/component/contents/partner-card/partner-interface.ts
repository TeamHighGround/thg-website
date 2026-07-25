import { PartnerEntry } from '../../../core/api/models';

/**
 * Un partenaire ou un ambassadeur, tel que renvoyé par `GET /api/partners`.
 *
 * L'alias conserve le nom historique utilisé par `app-partner-card` : la forme
 * est désormais celle du contrat d'API (`id` en uuid, `images` en objets
 * `Media` porteurs de leurs dimensions).
 */
export type Partner = PartnerEntry;
