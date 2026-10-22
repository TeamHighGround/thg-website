import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopComponent } from './shop';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoModule } from '@jsverse/transloco';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent, TranslocoModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a sanitized widget URL', () => {
    expect(component.widgetUrl).toBeTruthy();
  });
});
