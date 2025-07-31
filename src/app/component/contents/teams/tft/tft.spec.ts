import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tft } from './tft';

describe('Tft', () => {
  let component: Tft;
  let fixture: ComponentFixture<Tft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
