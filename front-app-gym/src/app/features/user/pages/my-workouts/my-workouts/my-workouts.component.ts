import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService, TrackingService } from '@core/services';
import { UserWeekAssignment } from '@core/models';

interface WorkoutDayStatus {
  day: any;
  isCompletedToday: boolean;
  workoutLog?: any;
}

@Component({
  selector: 'app-my-workouts',
  templateUrl: './my-workouts.component.html',
  styleUrls: ['./my-workouts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyWorkoutsComponent implements OnInit {
  assignment: UserWeekAssignment | null = null;
  workoutStatuses: WorkoutDayStatus[] = [];
  loading = true;
  error = '';
  today: string;

  constructor(
    private assignmentService: AssignmentService,
    private trackingService: TrackingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Obtener fecha de hoy en formato YYYY-MM-DD
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  private loadWorkouts(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.assignmentService.getMyAssignment().subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.checkWorkoutStatuses();
      },
      error: (err) => {
        this.error = 'No workout program assigned yet. Please contact your trainer.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private checkWorkoutStatuses(): void {
    if (!this.assignment) {
      this.loading = false;
      return;
    }

    // Obtener logs de hoy
    this.trackingService.getWorkoutLogs({ 
      date: this.today 
    }).subscribe({
      next: (logs) => {
        // Crear mapa de workouts completados por nombre del workout
        const completedWorkoutsMap = new Map<string, any>();
        logs.forEach(log => {
          if (log.completed && log.workout_day_name) {
            completedWorkoutsMap.set(log.workout_day_name, log);
          }
        });

        // Verificar estado de cada día
        this.workoutStatuses = this.assignment!.week_template.days.map(day => {
          const workoutDayName = day.workout_day.name;
          const isCompletedToday = completedWorkoutsMap.has(workoutDayName);
          return {
            day: day.workout_day,
            isCompletedToday: isCompletedToday,
            workoutLog: completedWorkoutsMap.get(workoutDayName)
          };
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading workout logs:', err);
        // Si falla, mostrar todos como no completados
        this.workoutStatuses = this.assignment!.week_template.days.map(day => ({
          day: day.workout_day,
          isCompletedToday: false
        }));
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onStartWorkout(dayId: number): void {
    this.router.navigate(['/user/do-workout', dayId]);
  }

  onViewWorkout(dayId: number): void {
    // Navegar a vista de solo lectura o historial
    this.router.navigate(['/user/history'], { 
      queryParams: { workoutDayId: dayId, date: this.today } 
    });
  }

  getWorkoutIcon(day: any): string {
    // Puedes personalizar íconos según el tipo de workout
    return 'fitness_center';
  }

  getCompletionText(status: WorkoutDayStatus): string {
    if (status.isCompletedToday) {
      return 'Completed today';
    }
    return 'Not started';
  }

  getTodayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  }
}