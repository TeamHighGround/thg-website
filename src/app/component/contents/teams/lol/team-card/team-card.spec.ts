import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCard } from './team-card';

describe('TeamCard', () => {
  let component: TeamCard;
  let fixture: ComponentFixture<TeamCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
