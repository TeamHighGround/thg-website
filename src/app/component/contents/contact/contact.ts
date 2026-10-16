import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { SiteSettingsService } from '../../../core/api/site-settings.service';
import { SiteSocialLinks } from '../../../core/api/models';

@Component({
  selector: 'app-contact',
  imports: [TranslocoModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  /** Réseaux de l'association, configurés dans le panel (« Réseaux sociaux »). */
  readonly reseaux = inject(SiteSettingsService).reseaux;

  /** Couleur de survol propre à chaque réseau (classes écrites en entier pour Tailwind). */
  readonly styles: Record<keyof SiteSocialLinks, { pastille: string; icone: string }> = {
    twitter: {
      pastille: 'group-hover/social:bg-blue-500/20 group-hover/social:border-blue-400/50 group-hover/social:shadow-blue-500/30 ring-blue-400',
      icone: 'group-hover/social:text-blue-400'
    },
    instagram: {
      pastille: 'group-hover/social:bg-pink-500/20 group-hover/social:border-pink-400/50 group-hover/social:shadow-pink-500/30 ring-pink-400',
      icone: 'group-hover/social:text-pink-400'
    },
    discord: {
      pastille: 'group-hover/social:bg-indigo-500/20 group-hover/social:border-indigo-400/50 group-hover/social:shadow-indigo-500/30 ring-indigo-400',
      icone: 'group-hover/social:text-indigo-400'
    }
  };

  mail: string = "contact@teamhighground.fr"
  copied = false;

  copyMail() {
    navigator.clipboard.writeText(this.mail).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}
