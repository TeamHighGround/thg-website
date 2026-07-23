import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TeamCard, TeamMember } from './team-card/team-card';

export interface LolTeam {
  key: 'league' | 'tour';
  name: string;
  logo: string;
  rosterImage: string;
  players: TeamMember[];
  staff: TeamMember[];
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
    ButtonModule,
    TeamCard
  ],
  templateUrl: './lol.html',
  styleUrls: ['./lol.scss']
})
export class Lol {

  teams: LolTeam[] = [
    {
      key: 'league',
      name: 'THG',
      logo: 'assets/logo/riot/nexus_league.png',
      rosterImage: './assets/image/roster_lol.jpg',
      players: [
        {
          name: 'Kitano',
          role: 'Top',
          image: 'assets/image/lol/KITANO.png',
          socialLinks: {
            twitter: 'https://x.com/Kitano_LoL',
            lolpros: 'https://lolpros.gg/player/kitano'
          }
        },
        {
          name: 'Infinity',
          role: 'Jungle',
          image: 'assets/image/lol/INFINITY.png',
          socialLinks: {
            twitter: 'https://x.com/Infinitylol989',
            lolpros: 'https://lolpros.gg/player/infinity'
          }
        },
        {
          name: 'Scimmia',
          role: 'Mid',
          image: 'assets/image/lol/SCIMMIA.png',
          socialLinks: {
            twitter: 'https://x.com/SClMMlA',
            lolpros: 'https://lolpros.gg/player/scimmia'
          }
        },
        {
          name: 'Tebox',
          role: 'ADC',
          image: 'assets/image/lol/TEBOX.png',
          socialLinks: {
            twitter: 'https://x.com/tebox_7',
            lolpros: 'https://lolpros.gg/player/tebox'
          }
        },
        {
          name: 'Metha',
          role: 'Support',
          image: 'assets/image/lol/METHA.png',
          socialLinks: {
            twitter: 'https://x.com/Methanaute',
            lolpros: 'https://lolpros.gg/player/methanaute'
          }
        }
      ],
      staff: [
        {
          name: 'Zarrix',
          role: 'Head Coach',
          socialLinks: {
            twitter: 'https://x.com/Zarrix_LoL'
          }
        },
        {
          name: 'Retiveo',
          role: 'Assistant Coach',
          socialLinks: {
            twitter: 'https://x.com/Coach_Renim'
          }
        },
        {
          name: 'KarmaaJF',
          role: 'Assistant Coach',
          socialLinks: {
            twitter: 'https://x.com/Karmaa_JF'
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
          name: 'Luminary',
          role: 'Assistant Manager',
          socialLinks: {
            twitter: 'https://x.com/xlmnry'
          }
        }
      ]
    },
    {
      key: 'tour',
      name: 'THG Skol',
      logo: 'assets/logo/riot/nexus_tour.png',
      rosterImage: './assets/image/roster_lol_skol.jpg',
      players: [
        {
          name: 'Misanthiel',
          role: 'Top',
          socialLinks: {
            twitter: 'https://x.com/Misanthiel_lol',
            lolpros: 'https://lolpros.gg/player/misanthiel'
          }
        },
        {
          name: 'Icarus',
          role: 'Jungle',
          socialLinks: {
            twitter: 'https://x.com/Icarus__lol',
            lolpros: 'https://lolpros.gg/player/icarus'
          }
        },
        {
          name: 'Orcybe',
          role: 'Mid',
          socialLinks: {
            twitter: 'https://x.com/Orcybee',
            lolpros: 'https://lolpros.gg/player/orcybe'
          }
        },
        {
          name: 'Kyx',
          role: 'ADC',
          socialLinks: {
            twitter: 'https://x.com/SynapseKyx',
            lolpros: 'https://lolpros.gg/player/kyx'
          }
        },
        {
          name: 'Rush',
          role: 'Support',
          socialLinks: {
            twitter: 'https://x.com/Rushounai',
            lolpros: 'https://lolpros.gg/player/rush'
          }
        }
      ],
      staff: [
        {
          name: 'Karken',
          role: 'Head Coach',
          socialLinks: {
            twitter: 'https://x.com/karkenlol'
          }
        },
        {
          name: 'Luminary',
          role: 'Manager',
          socialLinks: {
            twitter: 'https://x.com/xlmnry'
          }
        }
      ]
    }
  ];

  selectedTeam: LolTeam = this.teams[0];

  selectTeam(team: LolTeam): void {
    this.selectedTeam = team;
  }

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
