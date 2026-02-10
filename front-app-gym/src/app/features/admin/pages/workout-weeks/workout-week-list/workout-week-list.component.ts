import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '@core/services';
import { WorkoutWeekTemplateList } from '@core/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
@Component({
selector: 'app-workout-week-list',
templateUrl: './workout-week-list.component.html',
styleUrls: ['./workout-week-list.component.scss'],
changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutWeekListComponent implements OnInit {
workoutWeeks: WorkoutWeekTemplateList[] = [];
filteredWorkoutWeeks: WorkoutWeekTemplateList[] = [];
loading = true;
searchTerm = '';
displayedColumns: string[] = ['name', 'description', 'day_count', 'actions'];
constructor(
private workoutService: WorkoutService,
private router: Router,
private dialog: MatDialog,
private cdr: ChangeDetectorRef
) {}
ngOnInit(): void {
this.loadWorkoutWeeks();
}
loadWorkoutWeeks(): void {
this.loading = true;
this.cdr.markForCheck();
this.workoutService.getWorkoutWeeks().subscribe({
  next: (workoutWeeks) => {
    this.workoutWeeks = workoutWeeks;
    this.filteredWorkoutWeeks = workoutWeeks;
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
let filtered = [...this.workoutWeeks];
if (this.searchTerm) {
  filtered = filtered.filter(ww =>
    ww.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    ww.description.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

this.filteredWorkoutWeeks = filtered;
this.cdr.markForCheck();
}
onSearch(event: Event): void {
this.searchTerm = (event.target as HTMLInputElement).value;
this.applyFilters();
}
onEdit(id: number): void {
this.router.navigate(['/admin/workout-weeks/edit', id]);
}
onDelete(workoutWeek: WorkoutWeekTemplateList): void {
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
data: {
title: 'Delete Workout Week',
message: `Are you sure you want to delete "${workoutWeek.name}"?`,
confirmText: 'Delete',
cancelText: 'Cancel',
type: 'danger'
}
});
dialogRef.afterClosed().subscribe(confirmed => {
  if (confirmed) {
    this.workoutService.deleteWorkoutWeek(workoutWeek.id).subscribe({
      next: () => {
        this.loadWorkoutWeeks();
      }
    });
  }
});
}
onCreate(): void {
this.router.navigate(['/admin/workout-weeks/new']);
}
}