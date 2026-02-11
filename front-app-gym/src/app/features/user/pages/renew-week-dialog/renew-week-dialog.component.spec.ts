import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewWeekDialogComponent } from './renew-week-dialog.component';

describe('RenewWeekDialogComponent', () => {
  let component: RenewWeekDialogComponent;
  let fixture: ComponentFixture<RenewWeekDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewWeekDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewWeekDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
