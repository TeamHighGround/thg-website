import { Component, signal } from '@angular/core';
import { Header } from './component/header/header';
import { Content } from './component/content/content';
import { Footer } from './component/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, Content, Footer], // Ajoutez Test aux imports
  templateUrl: './app.html', // Utilisez directement le composant
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('thg-website');
}
