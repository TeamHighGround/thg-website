import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Partner } from './partner-interface';

@Component({
  selector: 'app-partner-card',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ChipModule, CardModule, ButtonModule],
  templateUrl: './partner-card.html',
  styleUrl: './partner-card.scss'
})
export class PartnerCard {
  @Input() partner!: Partner;
  
  currentImageIndex = 0;

  nextImage(): void {
    if (this.partner.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.partner.images.length;
    }
  }

  previousImage(): void {
    if (this.partner.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.partner.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  openSocialMedia(platform: string): void {
    if (this.partner.socialMedia) {
      const url = this.partner.socialMedia[platform as keyof typeof this.partner.socialMedia];
      if (url) {
        window.open(url, '_blank');
      }
    }
  }
}