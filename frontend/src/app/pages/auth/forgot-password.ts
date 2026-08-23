// src/app/pages/auth/forgot-password.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Header } from '../../shared/header';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        RippleModule,
        Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-header></app-header>

        <div class="forgot-container">
            <div class="forgot-card">
                <!-- 🌟 EN-TÊTE -->
                <div class="forgot-header">
                    <span class="header-emoji">🔑</span>
                    <h1 class="header-title">Mot de passe oublié ?</h1>
                    <p class="header-subtitle">Entrez votre email pour recevoir un mot de passe temporaire</p>
                </div>

                <!-- 📝 FORMULAIRE -->
                <form #forgotForm="ngForm" (ngSubmit)="onSubmit()">
                    <div class="form-group">
                        <label class="form-label">📧 Email</label>
                        <input 
                            pInputText 
                            [(ngModel)]="email" 
                            name="email"
                            #emailInput="ngModel"
                            required
                            email
                            placeholder="Entrez votre adresse email"
                            class="w-full"
                            [ngClass]="{'ng-invalid ng-dirty': emailInput.invalid && emailInput.dirty}"
                        />
                        <small class="form-error" *ngIf="emailInput.invalid && emailInput.dirty">
                            <span *ngIf="emailInput.errors?.['required']">⚠️ Email requis</span>
                            <span *ngIf="emailInput.errors?.['email']">⚠️ Veuillez entrer un email valide</span>
                        </small>
                    </div>

                    <!-- Message d'erreur -->
                    @if (errorMessage) {
                        <div class="error-box">
                            <span>😊 {{ errorMessage }}</span>
                        </div>
                    }

                    <!-- Mot de passe temporaire -->
                    @if (tempPassword) {
                        <div class="success-box">
                            <div class="temp-password-content">
                                <span class="temp-password-icon">📨</span>
                                <p class="temp-password-label">Votre mot de passe temporaire :</p>
                                <p class="temp-password-value">{{ tempPassword }}</p>
                                <p class="temp-password-hint">🔑 Connectez-vous puis changez-le dès que possible</p>
                            </div>
                        </div>
                    }

                    <!-- Bouton -->
                    <button type="submit" class="btn-submit" [disabled]="forgotForm.invalid || isLoading">
                        <span *ngIf="!isLoading">📩 Envoyer</span>
                        <span *ngIf="isLoading">⏳ Envoi en cours...</span>
                    </button>
                </form>

                <!-- Lien retour -->
                <div class="back-link">
                    <a routerLink="/auth/login">← Retour à la connexion</a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .forgot-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 2rem;
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        }

        .forgot-card {
            background: white;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .forgot-header {
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

        .form-error {
            display: block;
            font-size: 0.75rem;
            color: #ff6b6b;
            margin-top: 0.3rem;
        }

        ::ng-deep .form-group .p-inputtext {
            width: 100% !important;
            border-radius: 12px !important;
            border: 2px solid #e8e8e8 !important;
            transition: all 0.3s ease !important;
        }

        ::ng-deep .form-group .p-inputtext:focus {
            border-color: #ff6b6b !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
        }

        ::ng-deep .form-group .p-inputtext.ng-invalid.ng-dirty {
            border-color: #ff6b6b !important;
        }

        .error-box {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: #d63031;
            margin-bottom: 1.5rem;
            text-align: center;
            font-size: 0.95rem;
        }

        .success-box {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            border: 2px solid #00b894;
            border-radius: 16px;
            padding: 1.2rem 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .temp-password-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .temp-password-icon {
            font-size: 2.5rem;
        }

        .temp-password-label {
            color: #2d1b69;
            font-weight: 500;
            font-size: 0.95rem;
            margin: 0;
        }

        .temp-password-value {
            font-size: 2rem;
            font-weight: 700;
            color: #00b894;
            background: white;
            padding: 0.5rem 1.5rem;
            border-radius: 12px;
            font-family: monospace;
            letter-spacing: 2px;
            box-shadow: 0 2px 8px rgba(0, 184, 148, 0.2);
            margin: 0;
        }

        .temp-password-hint {
            color: #555;
            font-size: 0.8rem;
            margin: 0;
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

        .back-link {
            text-align: center;
            margin-top: 1.5rem;
        }

        .back-link a {
            color: #888;
            text-decoration: none;
            font-size: 0.95rem;
            transition: color 0.3s ease;
        }

        .back-link a:hover {
            color: #ff6b6b;
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .forgot-card {
                padding: 1.5rem;
            }

            .header-title {
                font-size: 1.5rem;
            }

            .header-emoji {
                font-size: 2.5rem;
            }

            .temp-password-value {
                font-size: 1.4rem;
                padding: 0.3rem 1rem;
            }
        }
    `]
})
export class ForgotPassword {
    email: string = '';
    tempPassword: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    onSubmit() {
        this.errorMessage = '';
        this.tempPassword = '';
        this.isLoading = true;

        if (!this.email) {
            this.errorMessage = '😊 Veuillez entrer votre email';
            this.isLoading = false;
            return;
        }

        // Validation email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = '😊 Veuillez entrer un email valide';
            this.isLoading = false;
            return;
        }

        this.authService.forgotPassword(this.email).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.tempPassword = response.temp_password;
                this.messageService.add({
                    severity: 'success',
                    summary: '📩 Email envoyé !',
                    detail: 'Vérifiez votre boîte mail 📨'
                });
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 404) {
                    this.errorMessage = '😊 Aucun compte associé à cet email';
                } else {
                    this.errorMessage = err.error?.detail || '😊 Une erreur est survenue. Réessayez.';
                }
            }
        });
    }
}