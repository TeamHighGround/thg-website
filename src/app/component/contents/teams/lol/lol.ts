import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TeamCard, TeamMember } from './team-card/team-card';

@Component({
  selector: 'app-lol',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    ChipModule,
    CardModule,
    AvatarModule,
    ButtonModule,
    TeamCard
  ],
  templateUrl: './lol.html',
  styleUrls: ['./lol.scss']
})
export class Lol {

  players: TeamMember[] = [
    {
      name: 'Phyraxx',
      role: 'Top',
      socialLinks: {
        twitter: 'https://x.com/Phyraxx_LoL',
        lolpros: 'https://lolpros.gg/player/phyraxx'
      }
    },
    {
      name: 'Artanis',
      role: 'Jungle',
      socialLinks: {
        twitter: 'https://x.com/lol_artanis'
      }
    },
    {
      name: 'Orcybe',
      role: 'Mid',
      socialLinks: {
        twitter: 'https://www.twitch.tv/orcybe',
        lolpros: 'https://lolpros.gg/player/orcybe'
      }
    },
    {
      name: 'Obli',
      role: 'ADC',
      socialLinks: {
        twitter: 'https://x.com/Obli_LOL',
        lolpros: 'https://lolpros.gg/player/obli'
      }
    },
    {
      name: 'Elliot',
      role: 'Support',
      socialLinks: {
        twitter: 'https://x.com/_elliot_LoL',
        lolpros: 'https://lolpros.gg/player/elliot'
      }
    }
  ];

  staff: TeamMember[] = [
    {
      name: 'Sollaw',
      role: 'Head Coach',
      socialLinks: {
        twitter: 'https://x.com/CoachSollaw',
      }
    },
    {
      name: 'Karken',
      role: 'Assistant Coach',
      socialLinks: {

      }
    },
    {
      name: 'Pouare',
      role: 'Data Analyst',
      socialLinks: {
      }
    },
    {
      name: 'Manzaro',
      role: 'Manager',
      socialLinks: {
      }
    }
  ];

  getRoleIcon = (role: string): string => {
    const icons: { [key: string]: string } = {
      'Top': 'assets/logo/lol-icons/top.svg',
      'Jungle': 'assets/logo/lol-icons/jungle.svg',
      'Mid': 'assets/logo/lol-icons/mid.svg',
      'ADC': 'assets/logo/lol-icons/adc.svg',
      'Support': 'assets/logo/lol-icons/support.svg',
      'Head Coach': 'assets/logo/lol-icons/coach.svg',
      'Assistant Coach': 'assets/logo/lol-icons/coach.svg',
      'Manager': 'pi-briefcase',
      'Data Analyst': 'assets/logo/lol-icons/analyst.svg'
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
