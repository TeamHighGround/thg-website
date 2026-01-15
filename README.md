# THG Website

Site officiel de **Team High Ground** - Association esport bretonne.

## Development

```bash
npm install               # Install dependencies
npm start                 # Start dev server (http://localhost:4200)
```

## Build & Deploy

```bash
ng build                  # Build with prerendering
firebase deploy           # Deploy to Firebase Hosting
```

Le build génère des pages HTML prérendues pour le SEO.

## Post-Deployment

Après le premier déploiement, configurer **Google Search Console** :

1. Aller dans [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `teamhighground.fr`
3. Soumettre le sitemap : `Sitemaps > Ajouter > sitemap.xml`
4. Demander l'indexation des pages principales

## Troubleshooting

```bash
rm -rf .angular/cache     # Clear cache if SSR errors occur
```

## Tech Stack

- Angular 20 + SSR/Prerendering
- Tailwind CSS + PrimeNG
- Firebase Hosting
- Transloco (i18n FR/EN)
