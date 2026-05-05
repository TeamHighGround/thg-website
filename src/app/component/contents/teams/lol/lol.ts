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
      name: 'Banabeer',
      role: 'Jungle',
      socialLinks: {
        lolpros: 'https://lolpros.gg/player/mrbanabeer'
      }
    },
    {
      name: 'Orcybe',
      role: 'Mid',
      socialLinks: {
        twitter: 'https://x.com/Orcybee'
      }
    },
    {
      name: 'Kyx',
      role: 'ADC',
      socialLinks: {
        twitter: 'https://x.com/SynapseKyx'
      }
    },
    {
      name: 'Rush',
      role: 'Support',
      socialLinks: {
        twitter: 'https://x.com/Rushounai'
      }
    }
  ];

  staff: TeamMember[] = [
    {
      name: 'Karken',
      role: 'Head Coach',
      socialLinks: {
        twitter: 'https://x.com/karkenlol'
      }
    },
    {
      name: 'D1verse',
      role: 'Assistant Coach',
      socialLinks: {
        twitter: 'https://x.com/D1verse3'
      }
    },
    {
      name: 'Luwey',
      role: 'Manager',
      socialLinks: {
        twitter: 'https://x.com/Luwey_LoL'
      }
    },
    {
      name: 'xLmnry',
      role: 'Assistant Manager',
      socialLinks: {
        twitter: 'https://x.com/xLmnry'
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
      'Assistant Manager': 'pi-briefcase',
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
      'Assistant Manager': 'bg-gray-400',
      'Data Analyst': 'bg-cyan-500'
    };
    return colors[role] || 'bg-gray-500';
  }
}
