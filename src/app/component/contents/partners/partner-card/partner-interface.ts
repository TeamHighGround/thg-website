export interface Partner {
  id: number;
  name: string;
  types: string[];
  description: string;
  images: string[];
  website?: string;
  socialMedia?: {
    instagram?: string;
    soundcloud?: string;
    spotify?: string;
    twitter?: string;
    twitch?: string;
  };
}