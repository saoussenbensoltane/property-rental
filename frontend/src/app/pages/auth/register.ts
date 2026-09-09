// src/app/pages/auth/register.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Header } from '../../shared/header';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        ButtonModule, InputTextModule, PasswordModule,
        SelectModule, ToastModule, RippleModule, Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-header></app-header>
        <div class="register-container">
            <div class="register-card">
                <div class="register-header">
                    <span class="header-emoji">✨</span>
                    <h1 class="header-title">Créer un compte</h1>
                    <p class="header-subtitle">Inscrivez-vous pour commencer</p>
                </div>
                <form #registerForm="ngForm" (ngSubmit)="onRegister()">
                    <div class="form-group">
                        <label class="form-label">📧 Email</label>
                        <input pInputText [(ngModel)]="email" name="email" #emailInput="ngModel" required email placeholder="Entrez votre email" class="w-full" [ngClass]="{'ng-invalid ng-dirty': emailInput.invalid && emailInput.dirty}" />
                        <small class="form-error" *ngIf="emailInput.invalid && emailInput.dirty">
                            <span *ngIf="emailInput.errors?.['required']">⚠️ L'email est requis</span>
                            <span *ngIf="emailInput.errors?.['email']">⚠️ Veuillez entrer un email valide</span>
                        </small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">🔒 Mot de passe</label>
                        <input pInputText type="password" [(ngModel)]="password" name="password" #passwordInput="ngModel" required [minlength]="8" [maxlength]="100" placeholder="Entrez votre mot de passe" class="w-full" [ngClass]="{'ng-invalid ng-dirty': passwordInput.invalid && passwordInput.dirty}" />
                        <small class="form-hint">🔑 Minimum 8 caractères avec majuscule, minuscule et chiffre</small>
                        <small class="form-error" *ngIf="passwordInput.invalid && passwordInput.dirty">
                            <span *ngIf="passwordInput.errors?.['required']">⚠️ Le mot de passe est requis</span>
                            <span *ngIf="passwordInput.errors?.['minlength']">⚠️ Minimum 8 caractères</span>
                        </small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">👤 Je suis</label>
                        <p-select [(ngModel)]="role" name="role" #roleInput="ngModel" required [options]="roleOptions" optionLabel="label" optionValue="value" placeholder="Sélectionnez votre rôle" styleClass="w-full" [ngClass]="{'ng-invalid ng-dirty': roleInput.invalid && roleInput.dirty}"></p-select>
                        <small class="form-hint">🏠 Choisissez votre type de profil</small>
                        <small class="form-error" *ngIf="roleInput.invalid && roleInput.dirty">⚠️ Le rôle est requis</small>
                    </div>
                    @if (errorMessage) {
                        <div class="error-box"><span>😊 {{ errorMessage }}</span></div>
                    }
                    <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || isLoading">
                        <span *ngIf="!isLoading">✨ S'inscrire</span>
                        <span *ngIf="isLoading">⏳ Création du compte...</span>
                    </button>
                </form>
                <div class="login-link">Vous avez déjà un compte ? <a routerLink="/auth/login">Se connecter</a></div>
            </div>
        </div>
    `,
    styles: [`
        .register-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 2rem; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); }
        .register-card { background: white; border-radius: 24px; padding: 2.5rem; max-width: 420px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .register-header { text-align: center; margin-bottom: 2rem; }
        .header-emoji { font-size: 3rem; display: block; margin-bottom: 0.5rem; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .header-title { font-size: 2rem; font-weight: 700; color: #2d1b69; margin: 0; }
        .header-subtitle { color: #888; font-size: 1rem; margin: 0.3rem 0 0; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #2d1b69; font-size: 0.95rem; }
        .form-hint { display: block; font-size: 0.75rem; color: #888; margin-top: 0.3rem; }
        .form-error { display: block; font-size: 0.75rem; color: #ff6b6b; margin-top: 0.3rem; }
        ::ng-deep .form-group .p-inputtext, ::ng-deep .form-group .p-select { width: 100% !important; border-radius: 12px !important; border: 2px solid #e8e8e8 !important; transition: all 0.3s ease !important; }
        ::ng-deep .form-group .p-inputtext:focus, ::ng-deep .form-group .p-select:focus { border-color: #ff6b6b !important; box-shadow: 0 0 0 3px rgba(255,107,107,0.1) !important; }
        ::ng-deep .form-group .p-inputtext.ng-invalid.ng-dirty { border-color: #ff6b6b !important; }
        .error-box { background: #fff5f5; border: 1px solid #ff6b6b; border-radius: 12px; padding: 0.8rem 1rem; color: #d63031; margin-bottom: 1.5rem; text-align: center; font-size: 0.95rem; }
        .btn-submit { width: 100%; padding: 0.8rem; border: none; border-radius: 50px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; font-weight: 600; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(238,90,36,0.3); }
        .btn-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 6px 25px rgba(238,90,36,0.4); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-link { text-align: center; margin-top: 1.5rem; color: #666; font-size: 0.95rem; }
        .login-link a { color: #ff6b6b; text-decoration: none; font-weight: 600; }
        .login-link a:hover { text-decoration: underline; }
        @media (max-width: 480px) { .register-card { padding: 1.5rem; } .header-title { font-size: 1.5rem; } .header-emoji { font-size: 2.5rem; } }
    `]
})
export class Register {
    email: string = '';
    password: string = '';
    role: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;
    roleOptions = [
        { label: '👤 Locataire (je cherche un logement)', value: 'user' },
        { label: '👔 Propriétaire (je loue mon bien)', value: 'owner' }
    ];
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    onRegister() {
        this.errorMessage = '';
        this.isLoading = true;
        if (!this.email || !this.password || !this.role) {
            this.errorMessage = '😊 Veuillez remplir tous les champs';
            this.isLoading = false;
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = '😊 Veuillez entrer un email valide';
            this.isLoading = false;
            return;
        }
        if (this.password.length < 8) {
            this.errorMessage = '😊 Le mot de passe doit contenir au moins 8 caractères';
            this.isLoading = false;
            return;
        }
        this.authService.register(this.email, this.password, this.role).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: '🎉 Compte créé !', detail: 'Bienvenue sur Property Rental Management ✨' });
                this.isLoading = false;
                this.router.navigate(['/properties']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422) {
                    const errors = err.error?.detail || [];
                    if (Array.isArray(errors) && errors.length > 0) {
                        this.errorMessage = errors.map((e: any) => e.msg || e.message || 'Champ invalide').join('. ');
                    } else {
                        this.errorMessage = '😊 Veuillez vérifier vos informations';
                    }
                } else if (err.status === 400) {
                    this.errorMessage = err.error?.detail || '😊 Cet email est déjà utilisé';
                } else if (err.status === 403) {
                    this.errorMessage = '😊 Impossible de s\'inscrire en tant qu\'admin';
                } else {
                    this.errorMessage = err.error?.detail || '😊 Une erreur est survenue. Réessayez.';
                }
            }
        });
    }
}