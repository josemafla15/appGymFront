import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WorkoutService, ExerciseService, UserService } from '@core/services';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalExercises: number;
  totalWorkoutDays: number;
  totalWorkoutWeeks: number;
  totalUsers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalExercises: 0,
    totalWorkoutDays: 0,
    totalWorkoutWeeks: 0,
    totalUsers: 0
  };

  loading = true;

  constructor(
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Cargar todas las estadísticas en paralelo
    forkJoin({
      exercises: this.exerciseService.getExercises(),
      workoutDays: this.workoutService.getWorkoutDays(),
      workoutWeeks: this.workoutService.getWorkoutWeeks(),
      users: this.userService.getUsers()
    }).subscribe({
      next: (results) => {
        this.stats = {
          totalExercises: results.exercises.length,
          totalWorkoutDays: results.workoutDays.length,
          totalWorkoutWeeks: results.workoutWeeks.length,
          totalUsers: results.users.length
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}