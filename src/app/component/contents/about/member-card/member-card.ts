import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';

export interface Member {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  specialties: string[];
}

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ChipModule, CardModule],
  templateUrl: './member-card.html',
  styleUrl: './member-card.scss'
})
export class MemberCard {
  @Input() member!: Member;
}