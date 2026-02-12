import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { WorkoutService, TrackingService } from '@core/services';
import { WorkoutDayTemplate } from '@core/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseNoteDialogComponent } from '../exercise-note-dialog/exercise-note-dialog/exercise-note-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-do-workout',
  templateUrl: './do-workout.component.html',
  styleUrls: ['./do-workout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoWorkoutComponent implements OnInit {
  workoutDay: WorkoutDayTemplate | null = null;
  workoutForm!: FormGroup;
  loading = true;
  saving = false;
  errorMessage = '';
  workoutLogId: number | null = null;
  dayOrder: number | null = null;  // ✅ NUEVO: Posición del día en la semana

  // Almacenar notas por ejercicio
  exerciseNotes: Map<number, string> = new Map();
  
  // Track which exercises are completed
  exercisesCompleted: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private workoutService: WorkoutService,
    private trackingService: TrackingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadWorkoutDay();
  }

  private initForm(): void {
    this.workoutForm = this.fb.group({
      exercises: this.fb.array([])
    });
  }

  get exercisesArray(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  private loadWorkoutDay(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // ✅ NUEVO: Obtener day_order de los query params (si viene desde my-workouts)
    const dayOrderParam = this.route.snapshot.queryParamMap.get('dayOrder');
    if (dayOrderParam) {
      this.dayOrder = parseInt(dayOrderParam, 10);
      console.log('✅ Day order recibido:', this.dayOrder);
    }
    
    if (!id) {
      this.router.navigate(['/user/workouts']);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.workoutService.getWorkoutDay(+id).subscribe({
      next: (workoutDay) => {
        this.workoutDay = workoutDay;
        this.setupExerciseForms();
        this.createOrLoadWorkoutLog();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load workout';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private setupExerciseForms(): void {
    if (!this.workoutDay) return;

    this.workoutDay.exercises.forEach((exercise, exerciseIndex) => {
      const sets = this.fb.array<FormGroup>([]);

      // Crear un form group para cada set
      for (let i = 0; i < exercise.number_of_sets; i++) {
        sets.push(this.fb.group({
          reps: [0, [Validators.required, Validators.min(0)]],
          weight: [0, [Validators.min(0)]]
        }));
      }

      this.exercisesArray.push(this.fb.group({
        exercise_id: [exercise.exercise.id],
        exercise_name: [exercise.exercise.name],
        sets: sets
      }));

      // Inicializar nota vacía para este ejercicio
      this.exerciseNotes.set(exerciseIndex, '');
    });

    this.cdr.markForCheck();
  }

  private createOrLoadWorkoutLog(): void {
    if (!this.workoutDay) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Primero intentar obtener el log existente
    this.trackingService.getWorkoutLogs({ 
      date: today,
      completed: false  
    }).subscribe({
      next: (logs) => {
        // ✅ CAMBIO CRÍTICO: Buscar por workout_day_id Y day_order
        const existingLog = logs.find(log => {
          const matchesWorkoutDay = log.workout_day === this.workoutDay?.id;
          const matchesDayOrder = this.dayOrder ? log.day_order === this.dayOrder : true;
          
          console.log('🔍 Comparando log:', {
            logWorkoutDay: log.workout_day,
            currentWorkoutDay: this.workoutDay?.id,
            logDayOrder: log.day_order,
            currentDayOrder: this.dayOrder,
            matches: matchesWorkoutDay && matchesDayOrder
          });
          
          return matchesWorkoutDay && matchesDayOrder;
        });

        if (existingLog) {
          // Si existe, cargar ese log
          console.log('✅ Found existing workout log:', existingLog.id);
          this.workoutLogId = existingLog.id;
          this.loadExistingSets(existingLog.id);
        } else {
          // Si no existe, crear uno nuevo
          console.log('ℹ️ No existing log found, creating new one');
          this.createNewWorkoutLog(today);
        }
      },
      error: () => {
        // Si falla la búsqueda, intentar crear uno nuevo
        this.createNewWorkoutLog(today);
      }
    });
  }

  private createNewWorkoutLog(date: string): void {
    if (!this.workoutDay) return;

    // ✅ CAMBIO CRÍTICO: Incluir day_order en la creación del log
    const logData: any = {
      workout_day_id: this.workoutDay.id,
      date: date,
      notes: ''
    };
    
    // ✅ NUEVO: Si tenemos day_order, incluirlo
    if (this.dayOrder !== null) {
      logData.day_order = this.dayOrder;
      console.log('✅ Creating log with day_order:', this.dayOrder);
    } else {
      // Si no tenemos day_order, usar 1 por defecto
      logData.day_order = 1;
      console.warn('⚠️ No day_order provided, using default: 1');
    }

    this.trackingService.createWorkoutLog(logData).subscribe({
      next: (log) => {
        console.log('✅ Created new workout log:', log);
        this.workoutLogId = log.id;
      },
      error: (err) => {
        console.error('❌ Error creating workout log:', err);
        
        // Si el error es de duplicado, intentar obtener el existente
        if (err.status === 500 && err.error?.includes?.('duplicate')) {
          this.findExistingLog();
        } else {
          this.snackBar.open('Error creating workout log', 'Close', { duration: 3000 });
        }
      }
    });
  }

  private findExistingLog(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.trackingService.getWorkoutLogs({ date: today }).subscribe({
      next: (logs) => {
        // ✅ CAMBIO: Buscar por workout_day_id Y day_order
        const existingLog = logs.find(log => 
          log.workout_day === this.workoutDay?.id &&
          (this.dayOrder ? log.day_order === this.dayOrder : true)
        );
        
        if (existingLog) {
          console.log('✅ Found existing log after error:', existingLog.id);
          this.workoutLogId = existingLog.id;
          this.loadExistingSets(existingLog.id);
        }
      },
      error: (err) => {
        console.error('❌ Error finding existing log:', err);
      }
    });
  }

  private loadExistingSets(workoutLogId: number): void {
    this.trackingService.getWorkoutLog(workoutLogId).subscribe({
      next: (log) => {
        console.log('📥 Loading existing sets:', log.set_logs);
        
        // Agrupar sets por ejercicio para determinar cuáles están completos
        const setsByExercise = new Map<number, any[]>();
        
        log.set_logs.forEach(setLog => {
          const exerciseId = setLog.exercise.id;
          if (!setsByExercise.has(exerciseId)) {
            setsByExercise.set(exerciseId, []);
          }
          setsByExercise.get(exerciseId)!.push(setLog);
        });
        
        // Cargar los valores en el formulario
        for (let i = 0; i < this.exercisesArray.length; i++) {
          const exerciseControl = this.exercisesArray.at(i);
          const exerciseId = exerciseControl.get('exercise_id')?.value;
          const setsArray = this.getSetsArray(i);
          
          const exerciseSets = setsByExercise.get(exerciseId) || [];
          
          // Si hay sets guardados para este ejercicio
          if (exerciseSets.length > 0) {
            // Cargar valores de sets
            exerciseSets.forEach(setLog => {
              const setIndex = setLog.set_number - 1;
              
              if (setIndex >= 0 && setIndex < setsArray.length) {
                const setControl = setsArray.at(setIndex);
                setControl.patchValue({
                  reps: setLog.reps,
                  weight: setLog.weight || 0
                });
              }
            });
            
            // Si todos los sets del ejercicio están guardados, marcar como completado
            if (exerciseSets.length === setsArray.length) {
              this.exercisesCompleted.add(i);
              // Deshabilitar todos los inputs del ejercicio
              setsArray.controls.forEach(control => {
                control.disable();
              });
            }
          }
        }
        
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error loading sets:', err);
      }
    });
  }

  getSetsArray(exerciseIndex: number): FormArray {
    return (this.exercisesArray.at(exerciseIndex).get('sets') as FormArray);
  }

  isExerciseCompleted(exerciseIndex: number): boolean {
    return this.exercisesCompleted.has(exerciseIndex);
  }

  canCompleteExercise(exerciseIndex: number): boolean {
    // Ya completado
    if (this.isExerciseCompleted(exerciseIndex)) {
      return false;
    }
    
    // Verificar que todos los sets tengan al menos 1 rep
    const setsArray = this.getSetsArray(exerciseIndex);
    for (let i = 0; i < setsArray.length; i++) {
      const reps = setsArray.at(i).get('reps')?.value;
      if (!reps || reps <= 0) {
        return false;
      }
    }
    
    return true;
  }

  onCompleteExercise(exerciseIndex: number): void {
    if (!this.workoutLogId) {
      this.snackBar.open('Error: No workout log found', 'Close', { duration: 3000 });
      return;
    }

    if (!this.canCompleteExercise(exerciseIndex)) {
      this.snackBar.open('Please enter at least 1 rep for all sets', 'Close', { duration: 3000 });
      return;
    }

    const setsArray = this.getSetsArray(exerciseIndex);
    const exerciseId = this.exercisesArray.at(exerciseIndex).get('exercise_id')?.value;
    
    // Guardar todos los sets del ejercicio
    const savePromises: Promise<any>[] = [];
    
    for (let setIndex = 0; setIndex < setsArray.length; setIndex++) {
      const setControl = setsArray.at(setIndex);
      const reps = setControl.get('reps')?.value;
      const weight = setControl.get('weight')?.value;

      const promise = this.trackingService.addSetToWorkout(this.workoutLogId, {
        exercise_id: exerciseId,
        set_number: setIndex + 1,
        reps: reps,
        weight: weight || undefined
      }).toPromise();
      
      savePromises.push(promise);
    }

    // Ejecutar todas las promesas
    this.saving = true;
    this.cdr.markForCheck();

    Promise.all(savePromises)
      .then(() => {
        // Marcar ejercicio como completado
        this.exercisesCompleted.add(exerciseIndex);
        
        // Deshabilitar todos los inputs del ejercicio
        setsArray.controls.forEach(control => {
          control.disable();
        });
        
        this.saving = false;
        this.snackBar.open(`${this.exercisesArray.at(exerciseIndex).get('exercise_name')?.value} completed! ✓`, 'Close', { 
          duration: 2000 
        });
        this.cdr.markForCheck();
      })
      .catch((err) => {
        console.error('❌ Error saving sets:', err);
        this.saving = false;
        this.snackBar.open('Error saving exercise', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      });
  }

  onAddExerciseNote(exerciseIndex: number): void {
    const currentNote = this.exerciseNotes.get(exerciseIndex) || '';
    const exerciseName = this.exercisesArray.at(exerciseIndex).get('exercise_name')?.value;

    const dialogRef = this.dialog.open(ExerciseNoteDialogComponent, {
      width: '500px',
      data: {
        exerciseName: exerciseName,
        note: currentNote
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.exerciseNotes.set(exerciseIndex, result);
        this.cdr.markForCheck();
      }
    });
  }

  hasNote(exerciseIndex: number): boolean {
    const note = this.exerciseNotes.get(exerciseIndex);
    return !!note && note.trim().length > 0;
  }

  allExercisesCompleted(): boolean {
    if (this.exercisesArray.length === 0) return false;
    return this.exercisesCompleted.size === this.exercisesArray.length;
  }

  onFinishWorkout(): void {
    if (!this.workoutLogId) {
      this.snackBar.open('Error: No workout log found', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    // Compilar todas las notas de ejercicios en una sola nota
    let compiledNotes = '';
    this.exerciseNotes.forEach((note, exerciseIndex) => {
      if (note && note.trim().length > 0) {
        const exerciseName = this.exercisesArray.at(exerciseIndex).get('exercise_name')?.value;
        compiledNotes += `${exerciseName}: ${note}\n`;
      }
    });

    // Actualizar el log con todas las notas
    this.trackingService.updateWorkoutLog(this.workoutLogId, {
      notes: compiledNotes.trim()
    }).subscribe({
      next: () => {
        // Marcar como completado
        this.trackingService.markWorkoutCompleted(this.workoutLogId!).subscribe({
          next: () => {
            console.log('✅ Workout completado exitosamente');
            this.snackBar.open('Workout completed! 🎉', 'Close', { duration: 3000 });
            this.router.navigate(['/user/workouts']);
          },
          error: () => {
            this.saving = false;
            this.snackBar.open('Error completing workout', 'Close', { duration: 3000 });
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error saving notes', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/user/workouts']);
  }

  goBack(): void {
    this.location.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
  }
}