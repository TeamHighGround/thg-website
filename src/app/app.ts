import { Component, signal } from '@angular/core';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Background } from "./component/background/background";
import { RouterOutlet } from '@angular/router';
import { CookieBannerComponent } from "./component/cookie-banner/cookie-banner";

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer, Background, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('thg-website');
}