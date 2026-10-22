import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { About } from "../about/about";
import { Timeline } from "../timeline/timeline";

@Component({
  selector: 'app-home',
  imports: [TranslocoModule, About, Timeline],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.scss'
})
export class Home {

}
