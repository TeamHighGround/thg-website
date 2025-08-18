import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ambassadors } from './ambassadors';

describe('Ambassadors', () => {
  let component: Ambassadors;
  let fixture: ComponentFixture<Ambassadors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ambassadors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ambassadors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
