import { Component, signal } from '@angular/core';
import { Test } from './test/test'; // Importez le composant Test

@Component({
  selector: 'app-root',
  imports: [Test], // Ajoutez Test aux imports
  template: `<app-test></app-test>`, // Utilisez directement le composant
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('thg-website');
}
