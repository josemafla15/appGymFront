import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutWeekListComponent } from './workout-week-list.component';

describe('WorkoutWeekListComponent', () => {
  let component: WorkoutWeekListComponent;
  let fixture: ComponentFixture<WorkoutWeekListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutWeekListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutWeekListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
