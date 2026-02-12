import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService, TrackingService } from '@core/services';
import { UserWeekAssignment } from '@core/models';

interface WorkoutDayStatus {
  day: any;
  dayOrder: number;  // ✅ NUEVO: Posición del día en la semana
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
        console.log('📊 Logs recibidos del backend:', logs);
        
        // ✅ CAMBIO CRÍTICO: Crear mapa usando workout_day_id + day_order
        // En lugar de solo usar el nombre del workout
        const completedWorkoutsMap = new Map<string, any>();
        
        logs.forEach(log => {
          if (log.completed) {
            // ✅ Clave única: workout_day_id + day_order
            const key = `${log.workout_day}_${log.day_order}`;
            completedWorkoutsMap.set(key, log);
            console.log(`✅ Log completado: workout_day=${log.workout_day}, day_order=${log.day_order}, key=${key}`);
          }
        });

        // Verificar estado de cada día
        this.workoutStatuses = this.assignment!.week_template.days.map((weekDay, index) => {
          // ✅ IMPORTANTE: Usar day_order del modelo WorkoutWeekDay
          const dayOrder = weekDay.day_order;
          const workoutDayId = weekDay.workout_day.id;
          
          // ✅ Crear la misma clave única que se usa para guardar
          const key = `${workoutDayId}_${dayOrder}`;
          const isCompletedToday = completedWorkoutsMap.has(key);
          
          console.log(`🔍 Día ${dayOrder}: ${weekDay.workout_day.name}`);
          console.log(`   - workout_day_id: ${workoutDayId}`);
          console.log(`   - day_order: ${dayOrder}`);
          console.log(`   - key: ${key}`);
          console.log(`   - ¿Completado?: ${isCompletedToday}`);
          
          return {
            day: weekDay.workout_day,
            dayOrder: dayOrder,  // ✅ NUEVO: Guardar la posición
            isCompletedToday: isCompletedToday,
            workoutLog: completedWorkoutsMap.get(key)
          };
        });

        console.log('✅ Estados finales:', this.workoutStatuses);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error loading workout logs:', err);
        // Si falla, mostrar todos como no completados
        this.workoutStatuses = this.assignment!.week_template.days.map((weekDay, index) => ({
          day: weekDay.workout_day,
          dayOrder: weekDay.day_order,  // ✅ NUEVO
          isCompletedToday: false
        }));
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ ACTUALIZADO: Pasar dayOrder como query param
  onStartWorkout(dayId: number, dayOrder: number): void {
    this.router.navigate(['/user/do-workout', dayId], {
      queryParams: { dayOrder: dayOrder }  // ✅ NUEVO: Pasar posición del día
    });
  }

  // ✅ ACTUALIZADO: Pasar dayOrder como query param
  onViewWorkout(dayId: number, dayOrder: number): void {
    // Navegar a vista de solo lectura o historial
    this.router.navigate(['/user/history'], { 
      queryParams: { 
        workoutDayId: dayId, 
        dayOrder: dayOrder,  // ✅ NUEVO
        date: this.today 
      } 
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