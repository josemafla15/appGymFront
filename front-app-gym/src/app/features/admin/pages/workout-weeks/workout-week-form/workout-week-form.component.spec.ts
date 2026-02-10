import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutWeekFormComponent } from './workout-week-form.component';

describe('WorkoutWeekFormComponent', () => {
  let component: WorkoutWeekFormComponent;
  let fixture: ComponentFixture<WorkoutWeekFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutWeekFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutWeekFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
