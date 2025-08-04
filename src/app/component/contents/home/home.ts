import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { About } from "../about/about";

@Component({
  selector: 'app-home',
  imports: [TranslocoModule, About],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
