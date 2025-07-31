import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lol } from './lol';

describe('Lol', () => {
  let component: Lol;
  let fixture: ComponentFixture<Lol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
