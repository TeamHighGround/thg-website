import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieSettings } from './cookie-settings';

describe('CookieSettings', () => {
  let component: CookieSettings;
  let fixture: ComponentFixture<CookieSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
