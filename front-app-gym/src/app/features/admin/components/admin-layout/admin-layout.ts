import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayout {
  currentUser$ = this.authService.currentUser$;
  sidebarOpened = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
  }

  onLogout(): void {
    this.authService.logout();
  }
}