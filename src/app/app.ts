import { Component, signal } from '@angular/core';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Background } from "./component/background/background";
import { TranslocoHttpLoader } from './transloco-loader';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer, Background],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('thg-website');
  
  // Injection du service pour s'assurer qu'il s'initialise
  constructor() {}
}