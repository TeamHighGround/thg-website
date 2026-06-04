import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  private platformId = inject(PLATFORM_ID);

  scrollToTimeline(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
