import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-tft',
  imports: [TranslocoModule],
  templateUrl: './tft.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tft.scss'
})
export class Tft {

}
