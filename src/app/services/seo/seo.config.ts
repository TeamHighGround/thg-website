export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  twitterCard?: 'summary' | 'summary_large_image';
}

export interface RoutesSeoConfig {
  [route: string]: {
    fr: SeoConfig;
    en: SeoConfig;
  };
}
