import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  UserRegistration,
  TokenRefreshRequest,
  TokenRefreshResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(environment.tokenKey);
  }

  private loadUserFromToken(): void {
    if (this.hasToken()) {
      this.getProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login/`, credentials).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
        this.isAuthenticatedSubject.next(true);
        
        this.getProfile().subscribe(user => {
          this.currentUserSubject.next(user);
        });
      })
    );
  }

  register(userData: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register/`, userData);
  }

  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const payload: TokenRefreshRequest = { refresh: refreshToken };
    return this.http.post<TokenRefreshResponse>(`${this.API_URL}/refresh/`, payload).pipe(
      tap(response => {
        this.setAccessToken(response.access);
        if (response.refresh) {
          this.setRefreshToken(response.refresh);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me/`);
  }

  logout(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem(environment.tokenKey, access);
    localStorage.setItem(environment.refreshTokenKey, refresh);
  }

  private setAccessToken(access: string): void {
    localStorage.setItem(environment.tokenKey, access);
  }

  private setRefreshToken(refresh: string): void {
    localStorage.setItem(environment.refreshTokenKey, refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === UserRole.ADMIN;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}