import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutDayFormComponent } from './workout-day-form.component';

describe('WorkoutDayFormComponent', () => {
  let component: WorkoutDayFormComponent;
  let fixture: ComponentFixture<WorkoutDayFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDayFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutDayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
