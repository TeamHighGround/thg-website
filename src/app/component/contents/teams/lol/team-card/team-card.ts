import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';

export interface TeamMember {
  name: string;
  role: string;
}

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ChipModule],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss'
})
export class TeamCard {
  @Input() member!: TeamMember;
  @Input() type: 'player' | 'staff' = 'player';
  @Input() getRoleIcon!: (role: string) => string;

  isImageIcon(): boolean {
    const icon = this.getRoleIcon(this.member.role);
    return icon.includes('.svg') || icon.includes('.png') || icon.includes('.jpg');
  }

  getChipClass(): string {
    const baseClass = this.type === 'player' ? 'role-chip role-' : 'staff-chip staff-';
    return baseClass + this.member.role.toLowerCase().replace(' ', '-');
  }
}