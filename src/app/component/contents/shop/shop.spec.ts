import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopComponent } from './shop';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoModule } from '@jsverse/transloco';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent, TranslocoModule],
      providers: [
        provideHttpClient(),
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

  it('should initialize with 3 products', () => {
    expect(component.products.length).toBe(3);
  });

  it('should have hoodie, tshirt, and cap products', () => {
    const productIds = component.products.map(p => p.id);
    expect(productIds).toContain('hoodie');
    expect(productIds).toContain('tshirt');
    expect(productIds).toContain('cap');
  });

  it('should open modal and set selected product', () => {
    component.openModal(component.products[0]);
    expect(component.modalVisible).toBeTrue();
    expect(component.selectedProduct).toBe(component.products[0]);
  });

  it('should reset selections when opening modal', () => {
    component.selectColor(component.products[0].colors[0]);
    component.openModal(component.products[1]);
    expect(component.selectedColor).toBeNull();
    expect(component.selectedSize).toBeNull();
  });

  it('should auto-select unique size for cap', () => {
    const cap = component.products.find(p => p.id === 'cap');
    component.openModal(cap!);
    expect(component.selectedSize).toEqual(cap!.sizes[0]);
  });

  it('should select color', () => {
    const color = component.products[0].colors[0];
    component.selectColor(color);
    expect(component.selectedColor).toBe(color);
    expect(component.orderForm.get('color')?.value).toBe(color);
  });

  it('should select size', () => {
    const size = component.products[0].sizes[0];
    component.selectSize(size);
    expect(component.selectedSize).toBe(size);
    expect(component.orderForm.get('size')?.value).toBe(size);
  });

  it('should invalidate form when required fields are empty', () => {
    expect(component.orderForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.orderForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });
});
