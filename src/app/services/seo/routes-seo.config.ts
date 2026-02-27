import { RoutesSeoConfig } from './seo.config';

export const SITE_URL = 'https://teamhighground.fr';
export const DEFAULT_IMAGE = `${SITE_URL}/assets/logo/green/THG_VERT.png`;
export const TWITTER_HANDLE = '@TeamHigh_Ground';

export const ROUTES_SEO_CONFIG: RoutesSeoConfig = {
  '/': {
    fr: {
      title: 'Team High Ground | Equipe Esport Bretonne - LoL & TFT',
      description: 'Team High Ground (THG) - Association esport bretonne basee a Rennes. Equipes competitives League of Legends et Teamfight Tactics. Rejoignez-nous !',
      keywords: ['esport bretagne', 'equipe esport rennes', 'team high ground', 'thg esport', 'lol france', 'tft france', 'esport amateur france'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Logo Team High Ground',
      twitterCard: 'summary_large_image'
    },
    en: {
      title: 'Team High Ground | Breton Esports Team - LoL & TFT',
      description: 'Team High Ground (THG) - Breton esports association based in Rennes, France. Competitive League of Legends and Teamfight Tactics teams. Join us!',
      keywords: ['esports france', 'esports team rennes', 'team high ground', 'thg esports', 'lol france', 'tft france', 'amateur esports'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Team High Ground Logo',
      twitterCard: 'summary_large_image'
    }
  },
  '/about': {
    fr: {
      title: 'A propos de THG | Notre Histoire et Notre Equipe',
      description: 'Decouvrez Team High Ground : association esport bretonne. Nos fondateurs, notre vision et notre engagement pour le esport en Bretagne.',
      keywords: ['histoire thg', 'fondateurs esport', 'association esport rennes', 'equipe thg', 'esport bretagne histoire'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Equipe Team High Ground'
    },
    en: {
      title: 'About THG | Our Story and Our Team',
      description: 'Discover Team High Ground: Breton esports association. Our founders, our vision and our commitment to esports in Brittany.',
      keywords: ['thg history', 'esports founders', 'esports association rennes', 'thg team', 'brittany esports history'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Team High Ground Team'
    }
  },
  '/teams/lol': {
    fr: {
      title: 'Equipe League of Legends | THG Esport',
      description: 'Roster League of Legends de Team High Ground. Decouvrez nos joueurs et notre staff coaching.',
      keywords: ['lol roster', 'league of legends france', 'equipe lol bretagne', 'joueurs lol', 'esport lol'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Roster League of Legends THG'
    },
    en: {
      title: 'League of Legends Team | THG Esport',
      description: 'Team High Ground League of Legends roster. Discover our players and coaching staff.',
      keywords: ['lol roster', 'league of legends france', 'lol team brittany', 'lol players', 'lol esports'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'THG League of Legends Roster'
    }
  },
  '/teams/tft': {
    fr: {
      title: 'Equipe Teamfight Tactics | THG Esport',
      description: 'Section Teamfight Tactics de Team High Ground. Rejoignez notre communaute TFT et representez les couleurs de la THG en tournoi.',
      keywords: ['tft france', 'teamfight tactics esport', 'tft bretagne', 'tournoi tft', 'equipe tft', 'tft competitif'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'THG Teamfight Tactics'
    },
    en: {
      title: 'Teamfight Tactics Team | THG Esport',
      description: 'Team High Ground Teamfight Tactics section. Join our TFT community and represent THG colors in tournaments.',
      keywords: ['tft france', 'teamfight tactics esports', 'tft brittany', 'tft tournament', 'tft team', 'competitive tft'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'THG Teamfight Tactics'
    }
  },
  '/news': {
    fr: {
      title: 'Actualites | THG - News Esport',
      description: 'Toutes les actualites de Team High Ground : resultats, annonces, recrutements et evenements esport en Bretagne.',
      keywords: ['actualites esport', 'news thg', 'resultats lol', 'evenements esport bretagne', 'annonces thg'],
      type: 'website',
      image: DEFAULT_IMAGE
    },
    en: {
      title: 'News | THG - Esports News',
      description: 'All Team High Ground news: results, announcements, recruitments and esports events in Brittany.',
      keywords: ['esports news', 'thg news', 'lol results', 'brittany esports events', 'thg announcements'],
      type: 'website',
      image: DEFAULT_IMAGE
    }
  },
  '/ambassadors': {
    fr: {
      title: 'Nos Ambassadeurs | Talents THG',
      description: 'Decouvrez les ambassadeurs de Team High Ground : casteurs, createurs de contenu et artistes qui representent nos couleurs.',
      keywords: ['ambassadeurs esport', 'casteurs lol', 'createurs contenu esport', 'influenceurs gaming', 'partenaires thg'],
      type: 'website',
      image: DEFAULT_IMAGE
    },
    en: {
      title: 'Our Ambassadors | THG Talents',
      description: 'Discover Team High Ground ambassadors: casters, content creators and artists who represent our colors.',
      keywords: ['esports ambassadors', 'lol casters', 'esports content creators', 'gaming influencers', 'thg partners'],
      type: 'website',
      image: DEFAULT_IMAGE
    }
  },
  '/partners': {
    fr: {
      title: 'Nos Partenaires | THG Esport Bretagne',
      description: 'Decouvrez les partenaires qui accompagnent Team High Ground dans le developpement de l\'esport en Bretagne : Mon Tournoi Esport, Station 35.',
      keywords: ['partenaires esport', 'mon tournoi esport', 'station 35 rennes', 'partenariats esport bretagne', 'sponsors thg'],
      type: 'website',
      image: DEFAULT_IMAGE
    },
    en: {
      title: 'Our Partners | THG Esports Brittany',
      description: 'Discover the partners who support Team High Ground in the development of esports in Brittany: Mon Tournoi Esport, Station 35.',
      keywords: ['esports partners', 'mon tournoi esport', 'station 35 rennes', 'esports partnerships brittany', 'thg sponsors'],
      type: 'website',
      image: DEFAULT_IMAGE
    }
  },
  '/shop': {
    fr: {
      title: 'Boutique THG | Merchandise Officiel Team High Ground',
      description: 'Commandez votre merchandise officiel Team High Ground : hoodies, t-shirts et casquettes aux couleurs de la THG. Soutenez votre equipe esport bretonne !',
      keywords: ['merch esport', 'boutique thg', 'vetements esport', 'hoodie team high ground', 'tshirt esport', 'merchandise gaming', 'boutique esport france'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Boutique officielle Team High Ground',
      twitterCard: 'summary_large_image'
    },
    en: {
      title: 'THG Shop | Official Team High Ground Merchandise',
      description: 'Order your official Team High Ground merchandise: hoodies, t-shirts and caps in THG colors. Support your Breton esports team!',
      keywords: ['esports merch', 'thg shop', 'esports clothing', 'team high ground hoodie', 'esports tshirt', 'gaming merchandise', 'esports shop france'],
      type: 'website',
      image: DEFAULT_IMAGE,
      imageAlt: 'Official Team High Ground Shop',
      twitterCard: 'summary_large_image'
    }
  },
  '/contact': {
    fr: {
      title: 'Contact | Rejoindre THG ou Devenir Partenaire',
      description: 'Contactez Team High Ground : partenariats, recrutement joueurs, presse ou questions generales. Nous sommes ouverts aux collaborations.',
      keywords: ['contact esport', 'partenariat esport', 'rejoindre equipe esport', 'sponsor esport bretagne', 'contact thg'],
      type: 'website',
      image: DEFAULT_IMAGE
    },
    en: {
      title: 'Contact | Join THG or Become a Partner',
      description: 'Contact Team High Ground: partnerships, player recruitment, press or general inquiries. We are open to collaborations.',
      keywords: ['esports contact', 'esports partnership', 'join esports team', 'sponsor esports brittany', 'contact thg'],
      type: 'website',
      image: DEFAULT_IMAGE
    }
  },
  '/legal-notice': {
    fr: {
      title: 'Mentions Legales | Team High Ground',
      description: 'Mentions legales du site Team High Ground.',
      keywords: [],
      noIndex: true
    },
    en: {
      title: 'Legal Notice | Team High Ground',
      description: 'Legal notice of Team High Ground website.',
      keywords: [],
      noIndex: true
    }
  },
  '/privacy-policy': {
    fr: {
      title: 'Politique de Confidentialite | Team High Ground',
      description: 'Politique de confidentialite de Team High Ground.',
      keywords: [],
      noIndex: true
    },
    en: {
      title: 'Privacy Policy | Team High Ground',
      description: 'Team High Ground privacy policy.',
      keywords: [],
      noIndex: true
    }
  },
  '/cookie-settings': {
    fr: {
      title: 'Parametres des Cookies | Team High Ground',
      description: 'Gerez vos preferences de cookies sur le site Team High Ground.',
      keywords: [],
      noIndex: true
    },
    en: {
      title: 'Cookie Settings | Team High Ground',
      description: 'Manage your cookie preferences on Team High Ground website.',
      keywords: [],
      noIndex: true
    }
  }
};
