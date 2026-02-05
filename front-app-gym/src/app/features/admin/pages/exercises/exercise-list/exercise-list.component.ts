import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ExerciseService } from '@core/services';
import { ExerciseList, MuscleGroup } from '@core/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseListComponent implements OnInit {
  exercises: ExerciseList[] = [];
  filteredExercises: ExerciseList[] = [];
  loading = true;
  searchTerm = '';
  selectedMuscleGroup: MuscleGroup | '' = '';

  displayedColumns: string[] = ['name', 'muscle_group', 'actions'];

  muscleGroups = Object.values(MuscleGroup);

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.exerciseService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filteredExercises = exercises;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.exercises];

    if (this.searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedMuscleGroup) {
      filtered = filtered.filter(ex => ex.muscle_group === this.selectedMuscleGroup);
    }

    this.filteredExercises = filtered;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onMuscleGroupChange(): void {
    this.applyFilters();
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/exercises/edit', id]);
  }

  onDelete(exercise: ExerciseList): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Exercise',
        message: `Are you sure you want to delete "${exercise.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.exerciseService.deleteExercise(exercise.id).subscribe({
          next: () => {
            this.loadExercises();
          }
        });
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/admin/exercises/new']);
  }
}