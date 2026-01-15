import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerCard } from './partner-card';

describe('PartnerCard', () => {
  let component: PartnerCard;
  let fixture: ComponentFixture<PartnerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
