import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SocialLinks } from './social-links.interface';

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-links.html',
  styleUrl: './social-links.scss'
})
export class SocialLinksComponent {
  @Input() links?: SocialLinks;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  private platformId = inject(PLATFORM_ID);

  // Gestion de l'ouverture des liens
  openLink(platform: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.links) {
      const url = this.links[platform as keyof SocialLinks];
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  }

  // Gestion du clic molette
  onLinkMouseDown(event: MouseEvent, platform: string): void {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      event.preventDefault();
      event.stopPropagation();
      this.openLink(platform);
    }
  }

  // Gestion de l'auxclick
  onLinkAuxClick(event: MouseEvent, platform: string): void {
    if (event.button === 1) {
      event.preventDefault();
      event.stopPropagation();
      this.openLink(platform);
    }
  }

  // Obtenir les classes de taille
  getSizeClasses(): string {
    const sizes = {
      small: 'w-8 h-8 text-sm',
      medium: 'w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sm sm:text-base md:text-lg',
      large: 'w-12 h-12 text-lg'
    };
    return sizes[this.size];
  }
}
