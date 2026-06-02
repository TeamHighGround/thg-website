import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

interface Milestone {
  id: string;
  key: string;
  image?: string;
  roster?: string[];
  hasResult?: boolean;
  hasBadge?: boolean;
}

interface ChapterSection {
  id: string;
  key: string;
  milestones: Milestone[];
}

const IMG = 'assets/image/timeline/';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss'
})
export class Timeline {
  readonly chapters: ChapterSection[] = [
    {
      id: 'competitive',
      key: 'contents.timeline.chapters.competitive',
      milestones: [
        {
          id: 'b10', key: 'contents.timeline.chapters.competitive.milestones.b10',
          image: IMG + 'NTDEUXIEMEGEN.jpg',
          roster: ['Phyraxx', 'D1verse', 'Orcybe', 'Kyx', 'Rush'],
          hasBadge: true
        },
        {
          id: 'b9', key: 'contents.timeline.chapters.competitive.milestones.b9',
          image: IMG + 'GA2026.jpg',
          roster: ['Phyraxx', 'D1verse', 'Orcybe', 'Obli', 'Elliot'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b8', key: 'contents.timeline.chapters.competitive.milestones.b8',
          image: IMG + 'NTPREMIEREGEN.jpg',
          roster: ['Phyraxx', 'Artanis', 'Orcybe', 'Obli', 'Elliot'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b7', key: 'contents.timeline.chapters.competitive.milestones.b7',
          image: IMG + 'LPLOL.jpg',
          roster: ['Phyraxx', 'Soren', 'Alex', 'Aitlade', 'Kwebz'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b6', key: 'contents.timeline.chapters.competitive.milestones.b6',
          image: IMG + 'GA2025.jpg',
          roster: ['Repulsif', 'Tundra Rookie', 'Ultra Folle', 'Incre', 'Wixo'],
          hasResult: true, hasBadge: true
        }
      ]
    },
    {
      id: 'history',
      key: 'contents.timeline.chapters.history',
      milestones: [
        { id: 'b5', key: 'contents.timeline.chapters.history.milestones.b5' },
        { id: 'b4', key: 'contents.timeline.chapters.history.milestones.b4' },
        { id: 'b3', key: 'contents.timeline.chapters.history.milestones.b3', image: IMG + 'canapeshow.png' },
        { id: 'b2', key: 'contents.timeline.chapters.history.milestones.b2', image: IMG + 'premierescompetitions.jpg' },
        { id: 'b1', key: 'contents.timeline.chapters.history.milestones.b1', image: IMG + 'debuts.jpg' }
      ]
    }
  ];
}
