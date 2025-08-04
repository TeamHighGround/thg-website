import { Component, Input, OnInit } from '@angular/core';
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
export class PartnerCard implements OnInit {
  @Input() partner!: Partner;
  
  currentImageIndex = 0;

  ngOnInit() {
    console.log('PartnerCard ngOnInit called for:', this.partner?.name);
    this.currentImageIndex = 0;
  }

  nextImage(): void {
    console.log('Next image clicked, current index:', this.currentImageIndex);
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.partner.images.length;
      console.log('New index:', this.currentImageIndex);
    }
  }

  previousImage(): void {
    console.log('Previous image clicked, current index:', this.currentImageIndex);
    if (this.partner && this.partner.images && this.partner.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.partner.images.length - 1 
        : this.currentImageIndex - 1;
      console.log('New index:', this.currentImageIndex);
    }
  }

  setCurrentImage(index: number): void {
    console.log('Set image to index:', index);
    if (this.partner && this.partner.images && index >= 0 && index < this.partner.images.length) {
      this.currentImageIndex = index;
    }
  }

  openSocialMedia(platform: string): void {
    if (this.partner.socialMedia) {
      const url = this.partner.socialMedia[platform as keyof typeof this.partner.socialMedia];
      if (url) {
        window.open(url, '_blank');
        console.log("Opening " + url);
      }
    }
  }

  // Nouvelle méthode pour gérer le clic molette
  onSocialMediaMouseDown(event: MouseEvent, platform: string): void {
    // Bouton molette (button 1) ou clic gauche avec Ctrl
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      event.preventDefault();
      event.stopPropagation();
      this.openSocialMedia(platform);
    }
  }

  // Alternative avec auxclick (plus moderne)
  onSocialMediaAuxClick(event: MouseEvent, platform: string): void {
    // auxclick se déclenche pour tous les clics sauf le clic gauche
    if (event.button === 1) { // Bouton molette
      event.preventDefault();
      event.stopPropagation();
      this.openSocialMedia(platform);
    }
  }
}