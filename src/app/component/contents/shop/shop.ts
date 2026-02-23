import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';

interface Product {
  id: string;
  name: string;
  price: number;
  imageFront: string;
  imageBack: string;
  colors: Color[];
  sizes: Size[];
}

interface Color {
  id: string;
  name: string;
  hex: string;
}

interface Size {
  id: string;
  name: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    InputText,
    Textarea,
    Button,
    Dialog,
    Message
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent implements OnInit {
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  orderForm!: FormGroup;
  products: Product[] = [];
  selectedProduct: Product | null = null;
  selectedColor: Color | null = null;
  selectedSize: Size | null = null;
  modalVisible = false;
  confirmVisible = false;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  isBrowser = false;
  hoveredProductId: string | null = null;
  showingFrontImage = true;

  private readonly COLORS: Color[] = [
    { id: 'black', name: 'Noir', hex: '#1a1a1a' },
    { id: 'white', name: 'Blanc', hex: '#e5e5e5' },
    { id: 'grey', name: 'Gris', hex: '#6b7280' }
  ];

  private readonly CAP_COLORS: Color[] = [
    { id: 'black', name: 'Noir', hex: '#1a1a1a' }
  ];

  private readonly CLOTHING_SIZES: Size[] = [
    { id: 'S', name: 'S' },
    { id: 'M', name: 'M' },
    { id: 'L', name: 'L' },
    { id: 'XL', name: 'XL' }
  ];

  private readonly UNIQUE_SIZE: Size[] = [
    { id: 'unique', name: 'Unique' }
  ];

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initProducts();
    this.initForm();
  }

  private initProducts(): void {
    this.products = [
      {
        id: 'hoodie',
        name: 'Hoodie THG',
        price: 55,
        imageFront: 'assets/shop/hoodie/hoodie_front.jpg',
        imageBack: 'assets/shop/hoodie/hoodie_back.jpg',
        colors: this.COLORS,
        sizes: this.CLOTHING_SIZES
      },
      {
        id: 'tshirt',
        name: 'T-Shirt THG',
        price: 30,
        imageFront: 'assets/shop/tshirt/tshirt_front.jpg',
        imageBack: 'assets/shop/tshirt/tshirt_back.jpg',
        colors: this.COLORS,
        sizes: this.CLOTHING_SIZES
      },
      {
        id: 'cap',
        name: 'Casquette THG',
        price: 25,
        imageFront: 'assets/shop/cap/cap_front.jpg',
        imageBack: 'assets/shop/cap/cap_back.jpg',
        colors: this.CAP_COLORS,
        sizes: this.UNIQUE_SIZE
      }
    ];
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      color: [null, Validators.required],
      size: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      notes: ['']
    });
  }

  openModal(product: Product): void {
    this.selectedProduct = product;
    this.selectedColor = product.colors[0] ?? null;
    this.selectedSize = null;
    this.submitError = false;
    this.showingFrontImage = true;
    this.orderForm.reset({ quantity: 1, color: this.selectedColor });

    if (product.sizes.length === 1) {
      this.selectedSize = product.sizes[0];
      this.orderForm.patchValue({ size: product.sizes[0] });
    }

    this.modalVisible = true;
  }

  toggleImage(): void {
    this.showingFrontImage = !this.showingFrontImage;
  }

  selectColor(color: Color): void {
    this.selectedColor = color;
    this.orderForm.patchValue({ color });
  }

  selectSize(size: Size): void {
    this.selectedSize = size;
    this.orderForm.patchValue({ size });
  }

  showConfirmDialog(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.confirmVisible = true;
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedProduct || !this.selectedColor || !this.selectedSize) {
      return;
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const formData = this.orderForm.value;

      const templateParams = {
        orders: [{
          image_url: `${window.location.origin}/${this.selectedProduct.imageFront}`,
          name: this.selectedProduct.name,
          color: this.selectedColor.name,
          size: this.selectedSize.name,
          units: formData.quantity,
          price: this.selectedProduct.price
        }],
        cost: {
          total: this.selectedProduct.price * formData.quantity
        },
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || '—',
        notes: formData.notes || '—',
        order_date: new Date().toLocaleString('fr-FR')
      };

      const emailjs = await import('@emailjs/browser');

      // TODO: Replace with your EmailJS credentials
      await emailjs.default.send(
        'service_oipvf9u',
        'template_c1j90pf',
        templateParams,
        'Aq4CiWO2_X2I_ejUl'
      );

      this.submitSuccess = true;
      this.confirmVisible = false;
      this.modalVisible = false;
      this.orderForm.reset();
      this.selectedProduct = null;
      this.selectedColor = null;
      this.selectedSize = null;
    } catch (error) {
      console.error('Order submission error:', error);
      this.submitError = true;
    } finally {
      this.isSubmitting = false;
    }
  }

  onQuantityKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowed.includes(event.key) || (event.key >= '0' && event.key <= '9')) {
      return;
    }
    event.preventDefault();
  }

  onQuantityPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pasted)) {
      event.preventDefault();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
