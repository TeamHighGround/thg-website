import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

interface Milestone {
  id: string;
  key: string;
  icon: string;
  accent: 'blue' | 'purple' | 'orange' | 'green' | 'red' | 'yellow';
  roster?: string[];
  hasResult?: boolean;
  hasBadge?: boolean;
}

interface ChapterSection {
  id: string;
  index: string;
  key: string;
  milestones: Milestone[];
}

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
      id: 'history',
      index: '01',
      key: 'contents.timeline.chapters.history',
      milestones: [
        { id: 'b1', key: 'contents.timeline.chapters.history.milestones.b1', icon: '▶', accent: 'blue' },
        { id: 'b2', key: 'contents.timeline.chapters.history.milestones.b2', icon: '◆', accent: 'purple' },
        { id: 'b3', key: 'contents.timeline.chapters.history.milestones.b3', icon: '◉', accent: 'orange' },
        { id: 'b4', key: 'contents.timeline.chapters.history.milestones.b4', icon: '✦', accent: 'green' },
        { id: 'b5', key: 'contents.timeline.chapters.history.milestones.b5', icon: '▲', accent: 'red' }
      ]
    },
    {
      id: 'competitive',
      index: '02',
      key: 'contents.timeline.chapters.competitive',
      milestones: [
        {
          id: 'b6', key: 'contents.timeline.chapters.competitive.milestones.b6',
          icon: '⬢', accent: 'yellow',
          roster: ['Repulsif', 'Tundra Rookie', 'Ultra Folle', 'Incre', 'Wixo'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b7', key: 'contents.timeline.chapters.competitive.milestones.b7',
          icon: '◈', accent: 'orange',
          roster: ['Phyraxx', 'Soren', 'Alex', 'Aitlade', 'Kwebz'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b8', key: 'contents.timeline.chapters.competitive.milestones.b8',
          icon: '◎', accent: 'blue',
          roster: ['Phyraxx', 'Artanis', 'Orcybe', 'Obli', 'Elliot'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b9', key: 'contents.timeline.chapters.competitive.milestones.b9',
          icon: '▲', accent: 'red',
          roster: ['Phyraxx', 'D1verse', 'Orcybe', 'Obli', 'Elliot'],
          hasResult: true, hasBadge: true
        },
        {
          id: 'b10', key: 'contents.timeline.chapters.competitive.milestones.b10',
          icon: '⚡', accent: 'green',
          roster: ['Phyraxx', 'D1verse', 'Orcybe', 'Kyx', 'Rush'],
          hasBadge: true
        }
      ]
    }
  ];

  readonly activeIndex = signal(0);

  private readonly accentMap: Record<Milestone['accent'], string> = {
    blue: '#6db1ff', purple: '#c39bff', orange: '#ffb066',
    green: '#aed4ac', red: '#ff7676', yellow: '#f5d76b'
  };

  accentColor(accent: Milestone['accent']): string {
    return this.accentMap[accent];
  }

  private platformId = inject(PLATFORM_ID);

  selectChapter(index: number): void {
    this.activeIndex.set(index);
  }

  goToNextChapter(section: HTMLElement): void {
    this.activeIndex.set(1);
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        const top = section.getBoundingClientRect().top + window.scrollY + 500;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
  }
}
