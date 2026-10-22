import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Background } from './component/background/background';
import { SeoService } from './services/seo/seo.service';
import { JsonLdService } from './services/seo/json-ld.service';

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer, Background],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private seoService = inject(SeoService);
  private jsonLdService = inject(JsonLdService);

  ngOnInit(): void {
    this.seoService.initialize();
    this.jsonLdService.initialize();
  }
}
