import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { WorkoutService, TrackingService } from '@core/services';
import { WorkoutDayTemplate } from '@core/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseNoteDialogComponent } from '../exercise-note-dialog/exercise-note-dialog/exercise-note-dialog.component';

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

  // Almacenar notas por ejercicio
  exerciseNotes: Map<number, string> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
        this.createWorkoutLog();
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
          weight: [0, [Validators.min(0)]],
          completed: [false]
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

  private createWorkoutLog(): void {
    if (!this.workoutDay) return;

    const today = new Date().toISOString().split('T')[0];
    
    this.trackingService.createWorkoutLog({
      workout_day_id: this.workoutDay.id,
      date: today,
      notes: ''
    }).subscribe({
      next: (log) => {
        this.workoutLogId = log.id;
      },
      error: (err) => {
        console.error('Error creating workout log:', err);
      }
    });
  }

  getSetsArray(exerciseIndex: number): FormArray {
    return (this.exercisesArray.at(exerciseIndex).get('sets') as FormArray);
  }

  onSetCompleted(exerciseIndex: number, setIndex: number): void {
    const setsArray = this.getSetsArray(exerciseIndex);
    const setControl = setsArray.at(setIndex);
    const completed = setControl.get('completed')?.value;
    
    // Validar que tenga al menos 1 rep
    const reps = setControl.get('reps')?.value;
    if (!completed && reps <= 0) {
      this.snackBar.open('Please enter at least 1 rep', 'Close', { duration: 2000 });
      return;
    }

    if (!completed && this.workoutLogId) {
      // Guardar el set cuando se marca como completado
      const exerciseId = this.exercisesArray.at(exerciseIndex).get('exercise_id')?.value;
      const weight = setControl.get('weight')?.value;

      this.trackingService.addSetToWorkout(this.workoutLogId, {
        exercise_id: exerciseId,
        set_number: setIndex + 1,
        reps: reps,
        weight: weight || undefined
      }).subscribe({
        next: () => {
          setControl.patchValue({ completed: true });
          this.snackBar.open('Set saved! ✓', 'Close', { duration: 1500 });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.snackBar.open('Error saving set', 'Close', { duration: 3000 });
          console.error('Error saving set:', err);
        }
      });
    }
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

  allSetsCompleted(): boolean {
    if (this.exercisesArray.length === 0) return false;
    
    for (let i = 0; i < this.exercisesArray.length; i++) {
      const sets = this.getSetsArray(i);
      for (let j = 0; j < sets.length; j++) {
        if (!sets.at(j).get('completed')?.value) {
          return false;
        }
      }
    }
    return true;
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
}