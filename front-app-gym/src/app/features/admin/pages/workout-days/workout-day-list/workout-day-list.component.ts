import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '@core/services';
import { WorkoutDayTemplateList, WorkoutDayType } from '@core/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-workout-day-list',
  templateUrl: './workout-day-list.component.html',
  styleUrls: ['./workout-day-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutDayListComponent implements OnInit {
  workoutDays: WorkoutDayTemplateList[] = [];
  filteredWorkoutDays: WorkoutDayTemplateList[] = [];
  loading = true;
  searchTerm = '';
  selectedType: WorkoutDayType | '' = '';

  displayedColumns: string[] = ['name', 'type', 'exercise_count', 'actions'];

  workoutTypes = Object.values(WorkoutDayType);

  constructor(
    private workoutService: WorkoutService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWorkoutDays();
  }

  loadWorkoutDays(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.workoutService.getWorkoutDays().subscribe({
      next: (workoutDays) => {
        this.workoutDays = workoutDays;
        this.filteredWorkoutDays = workoutDays;
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
    let filtered = [...this.workoutDays];

    if (this.searchTerm) {
      filtered = filtered.filter(wd =>
        wd.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter(wd => wd.type === this.selectedType);
    }

    this.filteredWorkoutDays = filtered;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/workout-days/edit', id]);
  }

  onDelete(workoutDay: WorkoutDayTemplateList): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Workout Day',
        message: `Are you sure you want to delete "${workoutDay.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.workoutService.deleteWorkoutDay(workoutDay.id).subscribe({
          next: () => {
            this.loadWorkoutDays();
          }
        });
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/admin/workout-days/new']);
  }
}