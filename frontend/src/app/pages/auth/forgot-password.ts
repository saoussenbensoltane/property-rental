import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, RouterModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Mot de passe oublié</div>
                            <span class="text-muted-color font-medium">Entrez votre email pour recevoir un mot de passe temporaire</span>
                        </div>

                        <label class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <input pInputText type="text" placeholder="Email address" class="w-full md:w-120 mb-6" [(ngModel)]="email" />

                        <p-button label="Envoyer" styleClass="w-full" (onClick)="onSubmit()"></p-button>

                        @if (tempPassword) {
                            <div class="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded text-center">
                                <p class="mb-2">Votre mot de passe temporaire :</p>
                                <p class="text-xl font-bold">{{ tempPassword }}</p>
                                <p class="text-sm text-muted-color mt-2">Connectez-vous puis changez-le dès que possible.</p>
                            </div>
                        }

                        @if (errorMessage) {
                            <p class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
                        }

                        <div class="text-center mt-6">
                            <a routerLink="/auth/login" class="cursor-pointer text-primary font-medium">Retour à la connexion</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    email: string = '';
    tempPassword: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService) {}

    onSubmit() {
        this.errorMessage = '';
        this.tempPassword = '';

        if (!this.email) {
            this.errorMessage = 'Merci d\'entrer votre email';
            return;
        }

        this.authService.forgotPassword(this.email).subscribe({
            next: (response) => {
                this.tempPassword = response.temp_password;
            },
            error: (err) => {
                this.errorMessage = err.status === 404
                    ? 'Aucun compte associé à cet email'
                    : 'Erreur, réessaie plus tard';
            }
        });
    }
}