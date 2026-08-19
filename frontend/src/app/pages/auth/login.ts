// src/app/pages/auth/login.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CheckboxModule,
        ToastModule,
        RippleModule,
        AppFloatingConfigurator
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-floating-configurator />

        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <span class="header-emoji">🔐</span>
                    <h1 class="header-title">Welcome back</h1>
                    <p class="header-subtitle">Sign in to your account</p>
                </div>

                <form #loginForm="ngForm" (ngSubmit)="onLogin()">
                    <div class="form-group">
                        <label class="form-label">📧 Email</label>
                        <input 
                            pInputText 
                            [(ngModel)]="email" 
                            name="email"
                            #emailInput="ngModel"
                            required
                            email
                            placeholder="Enter your email"
                            class="w-full"
                            [ngClass]="{'ng-invalid ng-dirty': emailInput.invalid && emailInput.dirty}"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">🔒 Password</label>
                        <p-password 
                            [(ngModel)]="password" 
                            name="password"
                            #passwordInput="ngModel"
                            required
                            [toggleMask]="true"
                            placeholder="Enter your password"
                            styleClass="w-full"
                            [feedback]="false"
                            [ngClass]="{'ng-invalid ng-dirty': passwordInput.invalid && passwordInput.dirty}"
                        ></p-password>
                    </div>

                    <div class="form-options">
                        <div class="remember-me">
                            <p-checkbox [(ngModel)]="rememberMe" name="rememberMe" binary="true" inputId="rememberMe"></p-checkbox>
                            <label for="rememberMe">Remember me</label>
                        </div>
                        <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
                    </div>

                    @if (errorMessage) {
                        <div class="error-box">
                            <span>😊 {{ errorMessage }}</span>
                        </div>
                    }

                    <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || isLoading">
                        <span *ngIf="!isLoading">✨ Sign In</span>
                        <span *ngIf="isLoading">⏳ Signing in...</span>
                    </button>
                </form>

                <div class="register-link">
                    Don't have an account? <a routerLink="/auth/register">Sign up</a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        }

        .login-card {
            background: white;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .header-emoji {
            font-size: 3rem;
            display: block;
            margin-bottom: 0.5rem;
            animation: float 3s ease-in-out infinite;
        }

        .header-title {
            font-size: 2rem;
            font-weight: 700;
            color: #2d1b69;
            margin: 0;
        }

        .header-subtitle {
            color: #888;
            font-size: 1rem;
            margin: 0.3rem 0 0;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.4rem;
            font-weight: 600;
            color: #2d1b69;
            font-size: 0.95rem;
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
        }

        .forgot-link {
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .forgot-link:hover {
            text-decoration: underline;
        }

        ::ng-deep .form-group .p-inputtext,
        ::ng-deep .form-group .p-password {
            width: 100% !important;
            border-radius: 12px !important;
            border: 2px solid #e8e8e8 !important;
            transition: all 0.3s ease !important;
        }

        ::ng-deep .form-group .p-inputtext:focus,
        ::ng-deep .form-group .p-password:focus {
            border-color: #ff6b6b !important;
        }

        ::ng-deep .form-group .p-password .p-password-input {
            width: 100% !important;
            border: none !important;
        }

        .error-box {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: #d63031;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .btn-submit {
            width: 100%;
            padding: 0.8rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
            transform: scale(1.02);
        }

        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .register-link {
            text-align: center;
            margin-top: 1.5rem;
            color: #666;
            font-size: 0.95rem;
        }

        .register-link a {
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 600;
        }

        .register-link a:hover {
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 1.5rem;
            }
            .header-title {
                font-size: 1.5rem;
            }
        }
    `]
})
export class Login {
    email: string = '';
    password: string = '';
    rememberMe: boolean = true;
    errorMessage: string = '';
    isLoading: boolean = false;

    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    onLogin() {
        this.errorMessage = '';
        this.isLoading = true;

        if (!this.email || !this.password) {
            this.errorMessage = '😊 Veuillez remplir tous les champs';
            this.isLoading = false;
            return;
        }

        this.authService.login(this.email, this.password, this.rememberMe).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Bienvenue !',
                    detail: 'Heureux de vous revoir ✨'
                });
                this.isLoading = false;
                
                const role = this.authService.getRole();
                if (role === 'admin') {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.router.navigate(['/properties']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.detail || '😊 Email ou mot de passe incorrect';
            }
        });
    }
}