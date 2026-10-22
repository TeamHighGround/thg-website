import { Component, inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.scss'
})
export class About {
  private platformId = inject(PLATFORM_ID);

  scrollToTimeline(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
