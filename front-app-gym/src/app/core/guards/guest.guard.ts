import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard  {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return true;
        }
        
        const user = this.authService.currentUserValue;
        if (user && this.authService.isAdmin()) {
          return this.router.createUrlTree(['/admin/dashboard']);
        }
        
        return this.router.createUrlTree(['/user/dashboard']);
      })
    );
  }
}