import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, SelectModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
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
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-6" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-6" [fluid]="true" [feedback]="false"></p-password>

                            <label class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">I am a</label>
                            <p-select [(ngModel)]="role" [options]="roleOptions" optionLabel="label" optionValue="value" placeholder="Select a role" styleClass="w-full mb-8"></p-select>

                            <p-button label="Sign Up" styleClass="w-full" (onClick)="onRegister()"></p-button>
@if (errorMessage) {
    <p class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
}
                            <div class="text-center mt-6">
                                <span class="text-muted-color">Already have an account? </span>
                                <a routerLink="/auth/login" class="text-primary font-medium cursor-pointer">Sign in</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    email: string = '';
    password: string = '';
    role: string = '';
    errorMessage: string = '';

    roleOptions = [
        { label: 'Locataire (je cherche un logement)', value: 'user' },
        { label: 'Propriétaire (je loue mon bien)', value: 'owner' }
    ];

    constructor(private authService: AuthService, private router: Router) {}

    onRegister() {
    this.errorMessage = '';
    if (!this.email || !this.password || !this.role) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        return;
    }
    this.authService.register(this.email, this.password, this.role).subscribe({
        next: () => {
            const role = this.authService.getRole();
            if (role === 'admin') {
                this.router.navigate(['/dashboard']);
            } else {
                this.router.navigate(['/properties']);
            }
        },
        error: (err) => this.errorMessage = err.error?.detail || 'Erreur lors de l\'inscription'
    });
}
}