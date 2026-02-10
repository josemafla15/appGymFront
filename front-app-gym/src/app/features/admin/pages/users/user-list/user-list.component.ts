import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User, UserRole } from '@core/models';
import { UserService } from '@core/services';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  searchTerm = '';
  selectedRole: UserRole | '' = '';

  displayedColumns: string[] = ['email', 'username', 'name', 'role', 'date_joined', 'actions'];

  userRoles = Object.values(UserRole);

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchTerm) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.cdr.markForCheck();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onRoleChange(): void {
    this.applyFilters();
  }

  onViewDetails(id: number): void {
    this.router.navigate(['/admin/users', id]);
  }
}