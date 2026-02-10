import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '@core/services';
import { WorkoutWeekTemplate, WorkoutDayTemplateList } from '@core/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-workout-week-form',
  templateUrl: './workout-week-form.component.html',
  styleUrls: ['./workout-week-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutWeekFormComponent implements OnInit {
  workoutWeekForm!: FormGroup;
  loading = false;
  isEditMode = false;
  workoutWeekId: number | null = null;
  errorMessage = '';

  workoutWeek: WorkoutWeekTemplate | null = null;
  availableWorkoutDays: WorkoutDayTemplateList[] = [];

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadWorkoutDays();
    this.checkEditMode();
  }

  private initForm(): void {
    this.workoutWeekForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      days: this.fb.array([])
    });
  }

  get daysArray(): FormArray {
    return this.workoutWeekForm.get('days') as FormArray;
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.workoutWeekId = +id;
      this.loadWorkoutWeek(this.workoutWeekId);
    }
  }

  private loadWorkoutDays(): void {
    this.workoutService.getWorkoutDays().subscribe({
      next: (days) => {
        this.availableWorkoutDays = days;
        this.cdr.markForCheck();
      }
    });
  }

  private loadWorkoutWeek(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workoutService.getWorkoutWeek(id).subscribe({
      next: (workoutWeek) => {
        this.workoutWeek = workoutWeek;
        this.workoutWeekForm.patchValue({
          name: workoutWeek.name,
          description: workoutWeek.description
        });

        // Cargar días existentes
        workoutWeek.days.forEach(day => {
          this.daysArray.push(this.fb.group({
            workout_day_id: [day.workout_day.id, Validators.required],
            day_order: [day.day_order, [Validators.required, Validators.min(1), Validators.max(7)]]
          }));
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load workout week';
        this.cdr.markForCheck();
      }
    });
  }

  onAddDay(): void {
    const nextOrder = this.daysArray.length + 1;
    if (nextOrder > 7) {
      this.errorMessage = 'Maximum 7 days per week';
      return;
    }

    this.daysArray.push(this.fb.group({
      workout_day_id: ['', Validators.required],
      day_order: [nextOrder, [Validators.required, Validators.min(1), Validators.max(7)]]
    }));
    this.cdr.markForCheck();
  }

  onRemoveDay(index: number): void {
    this.daysArray.removeAt(index);
    // Reordenar los días
    this.daysArray.controls.forEach((control, i) => {
      control.patchValue({ day_order: i + 1 });
    });
    this.cdr.markForCheck();
  }

  getWorkoutDayName(workoutDayId: number): string {
    const day = this.availableWorkoutDays.find(d => d.id === workoutDayId);
    return day ? day.name : 'Unknown';
  }

  getWorkoutDayType(workoutDayId: number): string {
    const day = this.availableWorkoutDays.find(d => d.id === workoutDayId);
    return day ? day.type_display : '';
  }

  onSubmit(): void {
    if (this.workoutWeekForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const formValue = this.workoutWeekForm.value;
    const workoutWeekData = {
      name: formValue.name,
      description: formValue.description
    };

    const request = this.isEditMode && this.workoutWeekId
      ? this.workoutService.updateWorkoutWeek(this.workoutWeekId, workoutWeekData)
      : this.workoutService.createWorkoutWeek(workoutWeekData);

    request.subscribe({
      next: (workoutWeek) => {
        const workoutWeekId = workoutWeek.id;

        // Si hay días, agregarlos
        if (formValue.days && formValue.days.length > 0) {
          this.addDaysToWorkoutWeek(workoutWeekId, formValue.days);
        } else {
          this.router.navigate(['/admin/workout-weeks']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to save workout week';
        this.cdr.markForCheck();
      }
    });
  }

  private addDaysToWorkoutWeek(workoutWeekId: number, days: any[]): void {
    let completed = 0;
    const total = days.length;

    days.forEach((day) => {
      this.workoutService.addDayToWeek(workoutWeekId, day).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.router.navigate(['/admin/workout-weeks']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = `Failed to add day: ${error.message}`;
          this.cdr.markForCheck();
        }
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/workout-weeks']);
  }

  getExerciseCount(day: any): number {
    const workoutDayId = day.get('workout_day_id')?.value;
    
    const found = this.availableWorkoutDays.find(
      d => d.id === workoutDayId
    );
  
    return found?.exercise_count || 0;
  }

}