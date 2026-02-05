import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ExerciseService, WorkoutService } from '@core/services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  stats = {
    totalExercises: 0,
    totalWorkoutDays: 0,
    totalWorkoutWeeks: 0,
    totalUsers: 0
  };

  constructor(
    private exerciseService: ExerciseService,
    private workoutService: WorkoutService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      exercises: this.exerciseService.getExercises(),
      workoutDays: this.workoutService.getWorkoutDays(),
      workoutWeeks: this.workoutService.getWorkoutWeeks()
    }).subscribe({
      next: (data) => {
        this.stats.totalExercises = data.exercises.length;
        this.stats.totalWorkoutDays = data.workoutDays.length;
        this.stats.totalWorkoutWeeks = data.workoutWeeks.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}