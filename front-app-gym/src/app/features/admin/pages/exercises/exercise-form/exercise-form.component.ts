import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '@core/services';
import { MuscleGroup } from '@core/models';

@Component({
  selector: 'app-exercise-form',
  templateUrl: './exercise-form.component.html',
  styleUrls: ['./exercise-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseFormComponent implements OnInit {
  exerciseForm!: FormGroup;
  loading = false;
  isEditMode = false;
  exerciseId: number | null = null;
  errorMessage = '';

  muscleGroups = Object.values(MuscleGroup);

  constructor(
    private fb: FormBuilder,
    private exerciseService: ExerciseService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.exerciseForm = this.fb.group({
      name: ['', Validators.required],
      muscle_group: ['', Validators.required],
      image_url: [''],
      description: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.exerciseId = +id;
      this.loadExercise(this.exerciseId);
    }
  }

  private loadExercise(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.exerciseService.getExercise(id).subscribe({
      next: (exercise) => {
        this.exerciseForm.patchValue({
          name: exercise.name,
          muscle_group: exercise.muscle_group,
          image_url: exercise.image_url,
          description: exercise.description
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load exercise';
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const exerciseData = this.exerciseForm.value;

    const request = this.isEditMode && this.exerciseId
      ? this.exerciseService.updateExercise(this.exerciseId, exerciseData)
      : this.exerciseService.createExercise(exerciseData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/exercises']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to save exercise';
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/exercises']);
  }
}