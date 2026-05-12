import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { About } from "../about/about";
import { Timeline } from "../timeline/timeline";

@Component({
  selector: 'app-home',
  imports: [TranslocoModule, About, Timeline],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
