import { Component, Input, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Partner } from './partner-interface';
import { SocialLinksComponent } from '../../shared/social-links/social-links';

@Component({
  selector: 'app-partner-card',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ChipModule, CardModule, ButtonModule, SocialLinksComponent],
  templateUrl: './partner-card.html',
  styleUrl: './partner-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartnerCard implements OnInit, OnDestroy {
  @Input() partner!: Partner;
  private platformId = inject(PLATFORM_ID);

  currentImageIndex = 0;
  private imageInterval?: number;
  private readonly AUTO_SLIDE_DELAY = 5000; // 5 secondes
  private isHovered = false;

  ngOnInit() {
    this.currentImageIndex = 0;
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  // Gestion de l'auto-slide des images
  private startAutoSlide() {
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      this.imageInterval = window.setInterval(() => {
        if (!this.isHovered) {
          this.nextImage();
        }
      }, this.AUTO_SLIDE_DELAY);
    }
  }

  private stopAutoSlide() {
    if (this.imageInterval) {
      clearInterval(this.imageInterval);
      this.imageInterval = undefined;
    }
  }

  // Gestionnaires d'événements pour l'auto-slide
  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  // Navigation des images
  nextImage(): void {
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.partner.images.length;
    }
  }

  previousImage(): void {
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.partner.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  setCurrentImage(index: number): void {
    if (this.partner && this.partner.images && index >= 0 && index < this.partner.images.length) {
      this.currentImageIndex = index;
      // Redémarrer l'auto-slide après sélection manuelle
      this.stopAutoSlide();
      setTimeout(() => this.startAutoSlide(), 1000);
    }
  }

  // Gestion du clavier pour l'accessibilité
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.previousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.nextImage();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          // Pause/play de l'auto-slide
          if (this.imageInterval) {
            this.stopAutoSlide();
          } else {
            this.startAutoSlide();
          }
          break;
      }
    }
  }

}