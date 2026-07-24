import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { CookieSettingsComponent } from './cookie-settings';

describe('CookieSettingsComponent', () => {
  let component: CookieSettingsComponent;
  let fixture: ComponentFixture<CookieSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CookieSettingsComponent,
        TranslocoTestingModule.forRoot({
          langs: { fr: {}, en: {} },
          translocoConfig: { availableLangs: ['fr', 'en'], defaultLang: 'fr' }
        })
      ],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
