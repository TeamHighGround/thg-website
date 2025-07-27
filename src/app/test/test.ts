import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-test',
  imports: [ButtonModule, CardModule, InputTextModule],
  templateUrl: './test.html',
  styleUrl: './test.scss'
})
export class Test {

}
