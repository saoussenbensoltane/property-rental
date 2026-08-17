import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '@/app/services/auth';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
    template: `
        <div class="flex items-center justify-between px-6 py-4 bg-surface-0 dark:bg-surface-900 shadow mb-6">
            <a routerLink="/properties" class="text-xl font-bold text-primary cursor-pointer">Property Rental Management</a>

            <div class="flex items-center gap-3">
                <a routerLink="/properties" class="cursor-pointer text-surface-700 dark:text-surface-200">Logements</a>

                @if (isLoggedIn()) {
                    @if (role() === 'user') {
                        <a routerLink="/my-bookings" class="cursor-pointer text-surface-700 dark:text-surface-200">Mes réservations</a>
                    }
                    @if (role() === 'owner') {
                        <a routerLink="/add-property" class="cursor-pointer text-surface-700 dark:text-surface-200">Ajouter un logement</a>
                        <a routerLink="/owner-bookings" class="cursor-pointer text-surface-700 dark:text-surface-200">Réservations reçues</a>
                    }
                    @if (role() === 'admin') {
                        <a routerLink="/dashboard" class="cursor-pointer text-surface-700 dark:text-surface-200">Dashboard</a>
                    }

                    <button
                        type="button"
                        class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary cursor-pointer border-none"
                        (click)="profileMenu.toggle($event)"
                    >
                        <i class="pi pi-user"></i>
                    </button>
                    <p-menu #profileMenu [model]="profileItems" [popup]="true" />
                } @else {
                    <a routerLink="/auth/login" class="cursor-pointer text-primary font-medium">Se connecter</a>
                    <a routerLink="/auth/register" class="cursor-pointer text-primary font-medium">S'inscrire</a>
                }
            </div>
        </div>
    `
})
export class Header {
    authService = inject(AuthService);
    router = inject(Router);

    @ViewChild('profileMenu') profileMenu!: Menu;

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    role(): string | null {
        return this.authService.getRole();
    }

    email(): string | null {
        return this.authService.getEmail();
    }

    get profileItems(): MenuItem[] {
        return [
            {
                label: this.email() ?? '',
                disabled: true
            },
            { separator: true },
            {
                label: 'Se déconnecter',
                icon: 'pi pi-sign-out',
                command: () => this.logout()
            }
        ];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/properties']);
    }
}