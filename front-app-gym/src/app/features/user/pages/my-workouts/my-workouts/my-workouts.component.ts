import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService } from '@core/services';
import { UserWeekAssignment, WorkoutWeekDay } from '@core/models';

@Component({
  selector: 'app-my-workouts',
  templateUrl: './my-workouts.component.html',
  styleUrls: ['./my-workouts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyWorkoutsComponent implements OnInit {
  assignment: UserWeekAssignment | null = null;
  loading = true;
  error = '';

  constructor(
    private assignmentService: AssignmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAssignment();
  }

  private loadAssignment(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.assignmentService.getMyAssignment().subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No workout program assigned. Please contact your trainer.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onStartWorkout(day: WorkoutWeekDay): void {
    // Navegar a la página de realizar el workout
    this.router.navigate(['/user/workout', day.workout_day.id]);
  }

  getDayLabel(dayOrder: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOrder - 1] || `Day ${dayOrder}`;
  }
}