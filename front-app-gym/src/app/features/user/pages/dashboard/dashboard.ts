import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AssignmentService, TrackingService } from '@core/services';
import { UserWeekAssignment, WorkoutStats } from '@core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  assignment: UserWeekAssignment | null = null;
  stats: WorkoutStats | null = null;
  loading = true;
  error = '';

  constructor(
    private assignmentService: AssignmentService,
    private trackingService: TrackingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.assignmentService.getMyAssignment().subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'No workout assigned yet';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

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
}