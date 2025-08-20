import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100">
        <div class="col-md-6 col-lg-5 mx-auto">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="bi bi-person-plus text-primary" style="font-size: 3rem;"></i>
                <h2 class="mt-3 mb-1">Create Account</h2>
                <p class="text-muted">Join us to manage your code snippets</p>
              </div>

              <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      formControlName="fullName"
                      [class.is-invalid]="signupForm.get('fullName')?.invalid && signupForm.get('fullName')?.touched"
                      placeholder="Enter your full name"
                    >
                  </div>
                  <div class="invalid-feedback" *ngIf="signupForm.get('fullName')?.invalid && signupForm.get('fullName')?.touched">
                    Full name is required
                  </div>
                </div>

                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-at"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      formControlName="username"
                      [class.is-invalid]="signupForm.get('username')?.invalid && signupForm.get('username')?.touched"
                      placeholder="Choose a username"
                    >
                  </div>
                  <div class="invalid-feedback" *ngIf="signupForm.get('username')?.invalid && signupForm.get('username')?.touched">
                    <div *ngIf="signupForm.get('username')?.errors?.['required']">Username is required</div>
                    <div *ngIf="signupForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
                      placeholder="Enter your email"
                    >
                  </div>
                  <div class="invalid-feedback" *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched">
                    <div *ngIf="signupForm.get('email')?.errors?.['required']">Email is required</div>
                    <div *ngIf="signupForm.get('email')?.errors?.['email']">Please enter a valid email</div>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      formControlName="password"
                      [class.is-invalid]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched"
                      placeholder="Create a password"
                    >
                  </div>
                  <div class="invalid-feedback" *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched">
                    <div *ngIf="signupForm.get('password')?.errors?.['required']">Password is required</div>
                    <div *ngIf="signupForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <div class="alert alert-success" *ngIf="successMessage">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 mb-3"
                  [disabled]="signupForm.invalid || isLoading"
                >
                  <span class="spinner-border spinner-border-sm me-2" *ngIf="isLoading"></span>
                  <i class="bi bi-person-plus me-2" *ngIf="!isLoading"></i>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Already have an account?
                    <a routerLink="/login" class="text-primary text-decoration-none fw-semibold">
                      Sign in here
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 15px;
    }
    
    .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }
    
    .form-control {
      border-left: none;
    }
    
    .form-control:focus {
      box-shadow: none;
      border-color: #6366f1;
    }
    
    .input-group-text {
      border-color: #6366f1;
    }
    
    .form-control:focus + .input-group-text {
      border-color: #6366f1;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Please login.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
          console.error('Signup error:', error);
        }
      });
    }
  }
}