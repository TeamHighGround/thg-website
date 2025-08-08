import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-lol',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    ChipModule,
    CardModule,
    AvatarModule,
    ButtonModule
  ],
  templateUrl: './lol.html',
  styleUrls: ['./lol.scss']
})
export class Lol {

  players: TeamMember[] = [
    { name: 'Phyraxx', role: 'Top', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Soren', role: 'Jungle', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Alex', role: 'Mid', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Aitlade', role: 'ADC', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Kwebz', role: 'Support', avatar: 'assets/image/default_avatar.jpg' }
  ];

  staff: TeamMember[] = [
    { name: 'Lago', role: 'Head Coach', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Manzaro', role: 'Manager', avatar: 'assets/image/default_avatar.jpg' },
    { name: 'Pouare', role: 'Data Analyst', avatar: 'assets/image/default_avatar.jpg' }
  ];

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'Top': 'assets/logo/lol-icons/top.svg',
      'Jungle': 'assets/logo/lol-icons/jungle.svg',
      'Mid': 'assets/logo/lol-icons/mid.svg',
      'ADC': 'assets/logo/lol-icons/adc.svg',
      'Support': 'assets/logo/lol-icons/support.svg',
      // Pour le staff, gardez les icônes PrimeNG ou ajoutez d'autres SVG
      'Head Coach': 'pi-user-plus',
      'Manager': 'pi-briefcase',
      'Data Analyst': 'pi-chart-line'
    };
    return icons[role] || 'pi-user';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'Top': 'bg-blue-500',
      'Jungle': 'bg-green-500',
      'Mid': 'bg-purple-500',
      'ADC': 'bg-red-500',
      'Support': 'bg-yellow-500',
      'Head Coach': 'bg-teal-500',
      'Manager': 'bg-gray-500',
      'Data Analyst': 'bg-cyan-500'
    };
    return colors[role] || 'bg-gray-500';
  }
}