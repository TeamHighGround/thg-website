import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {}
