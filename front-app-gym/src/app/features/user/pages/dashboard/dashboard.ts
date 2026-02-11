import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AssignmentService, TrackingService } from '@core/services';
import { UserWeekAssignment, WorkoutStats } from '@core/models';
import { WeekInfo } from '@core/services/assignment.service';
import { MatDialog } from '@angular/material/dialog';
import { RenewWeekDialogComponent } from '../renew-week-dialog/renew-week-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  assignment: UserWeekAssignment | null = null;
  weekInfo: WeekInfo | null = null;
  stats: WorkoutStats | null = null;
  loading = true;
  error = '';

  constructor(
    private assignmentService: AssignmentService,
    private trackingService: TrackingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Cargar información detallada de la semana
    this.assignmentService.getMyWeekInfo().subscribe({
      next: (weekInfo) => {
        this.weekInfo = weekInfo;
        this.assignment = weekInfo.assignment;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'No workout program assigned yet. Please contact your trainer.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Cargar estadísticas
    this.trackingService.getWorkoutStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  onRenewWeek(): void {
    const dialogRef = this.dialog.open(RenewWeekDialogComponent, {
      width: '500px',
      data: {
        currentWeek: this.weekInfo,
        programName: this.assignment?.week_template.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.renewWeek(result.startDate);
      }
    });
  }

  private renewWeek(startDate?: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.assignmentService.renewMyWeek(startDate).subscribe({
      next: (response) => {
        this.snackBar.open('Week renewed successfully! 🎉', 'Close', { duration: 3000 });
        this.loadData(); // Recargar datos
      },
      error: (err) => {
        this.snackBar.open('Error renewing week: ' + err.message, 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getWeekProgress(): number {
    if (!this.weekInfo) return 0;
    return Math.round(this.weekInfo.completion_rate);
  }

  getProgressColor(): string {
    const progress = this.getWeekProgress();
    if (progress >= 80) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }
}