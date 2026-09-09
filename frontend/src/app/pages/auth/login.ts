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
import { Header } from '../../shared/header';
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
        Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-header></app-header>

        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <span class="header-emoji">🔐</span>
                    <h1 class="header-title">Bon retour</h1>
                    <p class="header-subtitle">Connectez-vous à votre compte</p>
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
                            placeholder="Entrez votre email"
                            class="w-full"
                            [ngClass]="{'ng-invalid ng-dirty': emailInput.invalid && emailInput.dirty}"
                        />
                        <small class="form-error" *ngIf="emailInput.invalid && emailInput.dirty">
                            <span *ngIf="emailInput.errors?.['required']">⚠️ L'email est requis</span>
                            <span *ngIf="emailInput.errors?.['email']">⚠️ Veuillez entrer un email valide</span>
                        </small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">🔒 Mot de passe</label>
                        <p-password 
                            [(ngModel)]="password" 
                            name="password"
                            #passwordInput="ngModel"
                            required
                            [toggleMask]="true"
                            placeholder="Entrez votre mot de passe"
                            styleClass="w-full"
                            [feedback]="false"
                            [ngClass]="{'ng-invalid ng-dirty': passwordInput.invalid && passwordInput.dirty}"
                        ></p-password>
                        <small class="form-error" *ngIf="passwordInput.invalid && passwordInput.dirty">
                            ⚠️ Le mot de passe est requis
                        </small>
                    </div>

                    <div class="form-options">
                        <div class="remember-me">
                            <p-checkbox [(ngModel)]="rememberMe" name="rememberMe" binary="true" inputId="rememberMe"></p-checkbox>
                            <label for="rememberMe">Se souvenir de moi</label>
                        </div>
                        <a routerLink="/auth/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
                    </div>

                    @if (errorMessage) {
                        <div class="error-box">
                            <span>😊 {{ errorMessage }}</span>
                        </div>
                    }

                    <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || isLoading">
                        <span *ngIf="!isLoading">✨ Se connecter</span>
                        <span *ngIf="isLoading">⏳ Connexion en cours...</span>
                    </button>
                </form>

                <div class="register-link">
                    Vous n'avez pas de compte ? <a routerLink="/auth/register">S'inscrire</a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
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

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
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
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
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
            box-shadow: 0 6px 25px rgba(238, 90, 36, 0.4);
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

        @media (max-width: 480px) {
            .login-card {
                padding: 1.5rem;
            }
            .header-title {
                font-size: 1.5rem;
            }
            .header-emoji {
                font-size: 2.5rem;
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
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Bienvenue !',
                    detail: 'Heureux de vous revoir ✨'
                });
            },
            error: (err) => {
                this.isLoading = false;
                
                if (err.status === 422) {
                    const errors = err.error?.detail || [];
                    if (Array.isArray(errors) && errors.length > 0) {
                        this.errorMessage = errors.map((e: any) => e.msg || e.message).join('. ');
                    } else {
                        this.errorMessage = '😊 Veuillez vérifier vos informations';
                    }
                } else {
                    this.errorMessage = err.error?.detail || '😊 Email ou mot de passe incorrect';
                }
            }
        });
    }
}