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
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        ToastModule,
        RippleModule,
        AppFloatingConfigurator
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-floating-configurator />

        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Create an account</div>
                            <span class="text-muted-color font-medium">Sign up to get started</span>
                        </div>

                        <div>
                            <!-- Email -->
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input 
                                pInputText 
                                id="email1" 
                                type="email" 
                                placeholder="Email address" 
                                class="w-full md:w-120 mb-6" 
                                [(ngModel)]="email" 
                            />

                            <!-- Password -->
                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password 
                                id="password1" 
                                [(ngModel)]="password" 
                                placeholder="Password" 
                                [toggleMask]="true" 
                                styleClass="mb-6" 
                                [fluid]="true" 
                                [feedback]="false"
                            ></p-password>

                            <!-- Role -->
                            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">I am a</label>
                            <p-select 
                                [(ngModel)]="role" 
                                [options]="roleOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Select a role" 
                                styleClass="w-full mb-8"
                            ></p-select>

                            <!-- Bouton -->
                            <p-button 
                                label="Sign Up" 
                                styleClass="w-full" 
                                (onClick)="onRegister()"
                                [disabled]="isLoading"
                            ></p-button>

                            <!-- ✅ AFFICHAGE CORRECT DE L'ERREUR -->
                            @if (errorMessage) {
                                <div class="error-box">
                                    <span>😊 {{ errorMessage }}</span>
                                </div>
                            }

                            <!-- Lien connexion -->
                            <div class="text-center mt-6">
                                <span class="text-muted-color">Already have an account? </span>
                                <a routerLink="/auth/login" class="text-primary font-medium cursor-pointer">Sign in</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .error-box {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: #d63031;
            margin: 1rem 0;
            text-align: center;
            font-size: 0.95rem;
        }
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
        // Réinitialiser les messages
        this.errorMessage = '';
        this.isLoading = true;

        // ============================================
        // 1. VALIDATIONS FRONTEND
        // ============================================

        // Vérifier que tous les champs sont remplis
        if (!this.email || !this.password || !this.role) {
            this.errorMessage = '😊 Veuillez remplir tous les champs';
            this.isLoading = false;
            return;
        }

        // Valider le format de l'email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = '😊 Veuillez entrer une adresse email valide';
            this.isLoading = false;
            return;
        }

        // Valider la longueur du mot de passe (min 8 caractères)
        if (this.password.length < 8) {
            this.errorMessage = '😊 Le mot de passe doit contenir au moins 8 caractères';
            this.isLoading = false;
            return;
        }

        // ============================================
        // 2. ENVOI AU BACKEND
        // ============================================

        this.authService.register(this.email, this.password, this.role).subscribe({
            next: (response) => {
                // Succès - Redirection
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Compte créé !',
                    detail: 'Bienvenue sur Property Rental Management ✨'
                });
                
                // Rediriger selon le rôle
                const role = this.authService.getRole();
                if (role === 'admin') {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.router.navigate(['/properties']);
                }
            },
            error: (err) => {
                // ============================================
                // 3. GESTION DES ERREURS
                // ============================================
                
                this.isLoading = false;
                
                // LOG POUR DEBUG (à supprimer en production)
                console.log('Erreur complète:', err);
                console.log('Status:', err.status);
                console.log('Message:', err.message);
                console.log('Error:', err.error);

                // --- Erreur 422 : Validation Pydantic ---
                if (err.status === 422) {
                    const detail = err.error?.detail;
                    
                    // Si c'est un tableau d'erreurs (format Pydantic)
                    if (Array.isArray(detail) && detail.length > 0) {
                        // Extraire les messages d'erreur
                        const errorMessages = detail.map((e: any) => {
                            // Format Pydantic standard
                            if (e.msg) return e.msg;
                            // Format custom
                            if (e.message) return e.message;
                            // Fallback
                            return 'Champ invalide';
                        });
                        this.errorMessage = '😊 ' + errorMessages.join('. ');
                    } 
                    // Si c'est une string
                    else if (typeof detail === 'string') {
                        this.errorMessage = '😊 ' + detail;
                    } 
                    // Si c'est autre chose
                    else {
                        this.errorMessage = '😊 Veuillez vérifier vos informations';
                    }
                } 
                
                // --- Erreur 400 : Email déjà utilisé ---
                else if (err.status === 400) {
                    const detail = err.error?.detail;
                    if (typeof detail === 'string') {
                        this.errorMessage = '😊 ' + detail;
                    } else {
                        this.errorMessage = '😊 Cet email est déjà utilisé';
                    }
                } 
                
                // --- Erreur 403 : Admin non autorisé ---
                else if (err.status === 403) {
                    const detail = err.error?.detail;
                    if (typeof detail === 'string') {
                        this.errorMessage = '😊 ' + detail;
                    } else {
                        this.errorMessage = '😊 Impossible de s\'inscrire en tant qu\'admin';
                    }
                } 
                
                // --- Erreur 500 : Erreur serveur ---
                else if (err.status >= 500) {
                    this.errorMessage = '😊 Erreur serveur. Veuillez réessayer plus tard.';
                } 
                
                // --- Autres erreurs ---
                else {
                    // Essayer d'extraire le message d'erreur
                    if (err.error?.detail && typeof err.error.detail === 'string') {
                        this.errorMessage = '😊 ' + err.error.detail;
                    } else if (err.error?.message && typeof err.error.message === 'string') {
                        this.errorMessage = '😊 ' + err.error.message;
                    } else if (err.message) {
                        this.errorMessage = '😊 ' + err.message;
                    } else {
                        this.errorMessage = '😊 Une erreur est survenue. Réessayez.';
                    }
                }

                // ✅ S'assurer que errorMessage est toujours une string
                if (typeof this.errorMessage !== 'string') {
                    this.errorMessage = '😊 Une erreur est survenue. Réessayez.';
                }
            }
        });
    }
}