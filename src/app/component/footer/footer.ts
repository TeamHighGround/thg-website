import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  imports: [TranslocoModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}