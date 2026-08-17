import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerBookings } from './owner-bookings';

describe('OwnerBookings', () => {
  let component: OwnerBookings;
  let fixture: ComponentFixture<OwnerBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerBookings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
