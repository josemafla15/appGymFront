import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService, ExerciseService } from '@core/services';
import { WorkoutDayType, ExerciseList, WorkoutDayTemplate, MuscleGroup } from '@core/models';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-workout-day-form',
  templateUrl: './workout-day-form.component.html',
  styleUrls: ['./workout-day-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutDayFormComponent implements OnInit {
  workoutDayForm!: FormGroup;
  loading = false;
  isEditMode = false;
  workoutDayId: number | null = null;
  errorMessage = '';

  workoutDay: WorkoutDayTemplate | null = null;
  allExercises: ExerciseList[] = [];
  filteredExercises: ExerciseList[] = [];
  
  workoutTypes = Object.values(WorkoutDayType);

  // Mapeo de tipos de día a grupos musculares permitidos
  private readonly allowedMuscleGroups: Record<WorkoutDayType, MuscleGroup[]> = {
    [WorkoutDayType.LEG_DAY]: [
      MuscleGroup.QUADRICEPS,
      MuscleGroup.HAMSTRINGS,
      MuscleGroup.GLUTES,
      MuscleGroup.CALVES
    ],
    [WorkoutDayType.PULL_DAY]: [
      MuscleGroup.LATS,
      MuscleGroup.TRAPS,
      MuscleGroup.LOWER_BACK,
      MuscleGroup.BICEPS,
      MuscleGroup.REAR_DELTS,
      MuscleGroup.SIDE_DELTS
    ],
    [WorkoutDayType.PUSH_DAY]: [
      MuscleGroup.CHEST,
      MuscleGroup.TRICEPS,
      MuscleGroup.FRONT_DELTS,
      MuscleGroup.SIDE_DELTS
    ],
    [WorkoutDayType.UPPER_BODY_DAY]: [
      MuscleGroup.LATS,
      MuscleGroup.TRAPS,
      MuscleGroup.LOWER_BACK,
      MuscleGroup.CHEST,
      MuscleGroup.FRONT_DELTS,
      MuscleGroup.SIDE_DELTS,
      MuscleGroup.REAR_DELTS,
      MuscleGroup.BICEPS,
      MuscleGroup.TRICEPS,
      MuscleGroup.FOREARMS,
      MuscleGroup.ABS,
      MuscleGroup.OBLIQUES
    ],
    [WorkoutDayType.FULL_BODY_DAY]: Object.values(MuscleGroup)
  };

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExercises();
    this.checkEditMode();
    this.setupTypeChangeListener();
  }

  private initForm(): void {
    this.workoutDayForm = this.fb.group({
      type: ['', Validators.required],
      name: [''],
      exercises: this.fb.array([])
    });
  }

  private setupTypeChangeListener(): void {
    this.workoutDayForm.get('type')?.valueChanges.subscribe((type: WorkoutDayType) => {
      if (type) {
        this.filterExercisesByType(type);
        // Limpiar ejercicios si cambia el tipo
        if (this.exercisesArray.length > 0) {
          this.exercisesArray.clear();
        }
        this.cdr.markForCheck();
      }
    });
  }

  private filterExercisesByType(type: WorkoutDayType): void {
    const allowedGroups = this.allowedMuscleGroups[type];
    this.filteredExercises = this.allExercises.filter(ex => 
      allowedGroups.includes(ex.muscle_group as MuscleGroup)
    );
  }

  get exercisesArray(): FormArray {
    return this.workoutDayForm.get('exercises') as FormArray;
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.workoutDayId = +id;
      this.loadWorkoutDay(this.workoutDayId);
    }
  }

  private loadExercises(): void {
    this.exerciseService.getExercises().subscribe({
      next: (exercises) => {
        this.allExercises = exercises;
        // Si ya hay un tipo seleccionado, filtrar
        const currentType = this.workoutDayForm.get('type')?.value;
        if (currentType) {
          this.filterExercisesByType(currentType);
        } else {
          this.filteredExercises = exercises;
        }
        this.cdr.markForCheck();
      }
    });
  }

  private loadWorkoutDay(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workoutService.getWorkoutDay(id).subscribe({
      next: (workoutDay) => {
        this.workoutDay = workoutDay;
        this.workoutDayForm.patchValue({
          type: workoutDay.type,
          name: workoutDay.name
        });

        // Filtrar ejercicios según el tipo
        this.filterExercisesByType(workoutDay.type);

        // Cargar ejercicios existentes
        workoutDay.exercises.forEach(ex => {
          this.exercisesArray.push(this.fb.group({
            exercise_id: [ex.exercise.id, Validators.required],
            order: [ex.order, [Validators.required, Validators.min(1)]],
            number_of_sets: [ex.number_of_sets, [Validators.required, Validators.min(1), Validators.max(10)]]
          }));
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load workout day';
        this.cdr.markForCheck();
      }
    });
  }

  onAddExercise(): void {
    const currentType = this.workoutDayForm.get('type')?.value;
    if (!currentType) {
      this.errorMessage = 'Please select a workout type first';
      return;
    }

    this.exercisesArray.push(this.fb.group({
      exercise_id: ['', Validators.required],
      order: [this.exercisesArray.length + 1, [Validators.required, Validators.min(1)]],
      number_of_sets: [3, [Validators.required, Validators.min(1), Validators.max(10)]]
    }));
    this.cdr.markForCheck();
  }

  onRemoveExercise(index: number): void {
    this.exercisesArray.removeAt(index);
    // Reordenar los números de orden
    this.exercisesArray.controls.forEach((control, i) => {
      control.patchValue({ order: i + 1 });
    });
    this.cdr.markForCheck();
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.allExercises.find(ex => ex.id === exerciseId);
    return exercise ? exercise.name : 'Unknown';
  }

  onSubmit(): void {
    if (this.workoutDayForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const formValue = this.workoutDayForm.value;
    const workoutDayData = {
      type: formValue.type,
      name: formValue.name
    };

    const request = this.isEditMode && this.workoutDayId
      ? this.workoutService.updateWorkoutDay(this.workoutDayId, workoutDayData)
      : this.workoutService.createWorkoutDay(workoutDayData);

    request.subscribe({
      next: (workoutDay) => {
        const workoutDayId = workoutDay.id;

        // Si hay ejercicios, agregarlos uno por uno
        if (formValue.exercises && formValue.exercises.length > 0) {
          this.addExercisesToWorkoutDay(workoutDayId, formValue.exercises);
        } else {
          // Si no hay ejercicios, redirigir directamente
          this.router.navigate(['/admin/workout-days']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to save workout day';
        this.cdr.markForCheck();
      }
    });
  }

  private addExercisesToWorkoutDay(workoutDayId: number, exercises: any[]): void {
    let completed = 0;
    const total = exercises.length;

    exercises.forEach((exercise) => {
      this.workoutService.addExerciseToDay(workoutDayId, exercise).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            // Todos los ejercicios agregados, redirigir
            this.router.navigate(['/admin/workout-days']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = `Failed to add exercise: ${error.message}`;
          this.cdr.markForCheck();
        }
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/workout-days']);
  }
}