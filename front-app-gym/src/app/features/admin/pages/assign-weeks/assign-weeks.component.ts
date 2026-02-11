import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssignmentService, WorkoutService } from '@core/services';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface UserListItem {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  current_assignment?: {
    week_template_name: string;
    start_date: string;
  };
}

@Component({
  selector: 'app-assign-weeks',
  templateUrl: './assign-weeks.component.html',
  styleUrls: ['./assign-weeks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignWeeksComponent implements OnInit {
  users: UserListItem[] = [];
  weekTemplates: any[] = [];  // Usar any para evitar problemas de tipos
  assignmentForm!: FormGroup;
  loading = true;
  saving = false;
  selectedUser: UserListItem | null = null;

  displayedColumns: string[] = ['name', 'email', 'current_assignment', 'actions'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private assignmentService: AssignmentService,
    private workoutService: WorkoutService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    const nextMonday = this.getNextMonday();
    
    this.assignmentForm = this.fb.group({
      user_id: ['', Validators.required],
      week_template_id: ['', Validators.required],
      start_date: [nextMonday, Validators.required]
    });
  }

  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  }

  private loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    Promise.all([
      this.loadUsers(),
      this.loadWeekTemplates()
    ]).then(() => {
      this.loading = false;
      this.cdr.markForCheck();
    }).catch(err => {
      console.error('Error loading data:', err);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<UserListItem[]>(`${environment.apiUrl}/auth/users/`).subscribe({
        next: (users) => {
          this.users = users.filter(u => u.is_active && u.email !== 'admin@example.com');
          resolve();
        },
        error: (err) => {
          this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
          reject(err);
        }
      });
    });
  }

  private loadWeekTemplates(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.workoutService.getWorkoutWeeks().subscribe({
        next: (templates: any) => {
          this.weekTemplates = templates;
          resolve();
        },
        error: (err) => {
          this.snackBar.open('Error loading week templates', 'Close', { duration: 3000 });
          reject(err);
        }
      });
    });
  }

  onSelectUser(user: UserListItem): void {
    this.selectedUser = user;
    this.assignmentForm.patchValue({
      user_id: user.id
    });
    this.cdr.markForCheck();
  }

  onAssignWeek(): void {
    if (this.assignmentForm.invalid) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const userId = this.assignmentForm.get('user_id')?.value;
    const formData = {
      week_template_id: this.assignmentForm.get('week_template_id')?.value,
      start_date: this.formatDate(this.assignmentForm.get('start_date')?.value)
    };

    this.assignmentService.assignWeekToUser(userId, formData).subscribe({
      next: (assignment) => {
        this.snackBar.open('Week assigned successfully! 🎉', 'Close', { duration: 3000 });
        this.assignmentForm.patchValue({
          week_template_id: '',
          start_date: this.getNextMonday()
        });
        this.selectedUser = null;
        this.saving = false;
        
        this.loadUsers();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error assigning week:', err);
        this.snackBar.open('Error assigning week: ' + (err.error?.message || 'Unknown error'), 'Close', { 
          duration: 5000 
        });
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getUserFullName(user: UserListItem): string {
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }

  getCurrentAssignment(user: UserListItem): string {
    if (user.current_assignment) {
      return `${user.current_assignment.week_template_name} (from ${user.current_assignment.start_date})`;
    }
    return 'Not assigned';
  }

  hasAssignment(user: UserListItem): boolean {
    return !!user.current_assignment;
  }
}