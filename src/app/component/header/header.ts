import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

}
