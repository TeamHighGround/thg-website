import { SocialLinks } from '../../shared/social-links/social-links.interface';

export interface Partner {
  id: number;
  name: string;
  types: string[];
  description: string;
  images: string[];
  website?: string;
  socialMedia?: SocialLinks;
}