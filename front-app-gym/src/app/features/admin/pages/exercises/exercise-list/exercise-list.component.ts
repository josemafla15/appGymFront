import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  ViewChild, 
  AfterViewInit 
} from '@angular/core';
import { Router } from '@angular/router';
import { ExerciseService } from '@core/services';
import { ExerciseList, MuscleGroup } from '@core/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseListComponent implements OnInit, AfterViewInit {

  exercises: ExerciseList[] = [];
  filteredExercises: ExerciseList[] = [];

  dataSource = new MatTableDataSource<ExerciseList>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  // ================= INIT =================

  ngOnInit(): void {
    this.loadExercises();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.paginator.pageSize = 20;
  }

  // ================= LOAD =================

  loadExercises(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.exerciseService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filteredExercises = exercises;

        this.dataSource.data = exercises;

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ================= FILTERS =================

  applyFilters(): void {
    let filtered = [...this.exercises];

    if (this.searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedMuscleGroup) {
      filtered = filtered.filter(
        ex => ex.muscle_group === this.selectedMuscleGroup
      );
    }

    this.filteredExercises = filtered;
    this.dataSource.data = filtered;

    // Resetear a primera página al filtrar
    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onMuscleGroupChange(): void {
    this.applyFilters();
  }

  // ================= ACTIONS =================

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
          next: () => this.loadExercises()
        });
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/admin/exercises/new']);
  }
}
