import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful, response:', response);
        
        // Esperar un momento para que el servicio actualice currentUser
        setTimeout(() => {
          const user = this.authService.currentUserValue;
          console.log('Current user after login:', user);
          
          this.loading = false;
          
          if (user) {
            console.log('User role:', user.role);
            
            if (user.role === 'ADMIN') {
              console.log('Navigating to admin dashboard');
              this.router.navigate(['/admin/dashboard']);
            } else {
              console.log('Navigating to user dashboard');
              this.router.navigate(['/user/dashboard']);
            }
          } else {
            console.error('No user found after login!');
            // Hacer una llamada explícita al perfil
            this.authService.getProfile().subscribe({
              next: (profileUser) => {
                console.log('Profile user:', profileUser);
                if (profileUser.role === 'ADMIN') {
                  this.router.navigate(['/admin/dashboard']);
                } else {
                  this.router.navigate(['/user/dashboard']);
                }
              },
              error: (err) => {
                console.error('Error getting profile:', err);
                this.errorMessage = 'Error al obtener perfil de usuario';
                this.cdr.markForCheck();
              }
            });
          }
          
          this.cdr.markForCheck();
        }, 100);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
        this.cdr.markForCheck();
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}