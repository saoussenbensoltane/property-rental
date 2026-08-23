// src/app/shared/header/header.component.ts
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
        <!-- 🌟 HEADER CUTE -->
        <header class="header-container">
            <div class="header-content">
                <!-- Logo -->
                <a [routerLink]="getHomeRoute()" class="logo">
                    <span class="logo-icon">🏠</span>
                    <span class="logo-text">Property<span class="logo-highlight">Rental</span></span>
                </a>

                <!-- Navigation -->
                <nav class="nav-links">
                    <a routerLink="/properties" class="nav-link" [class.active]="isActive('/properties')">
                        <span class="nav-icon">🔍</span>
                        <span>Logements</span>
                    </a>

                    @if (isLoggedIn()) {
                        <!-- 👤 UTILISATEUR -->
                        @if (role() === 'user') {
                            <a routerLink="/my-bookings" class="nav-link" [class.active]="isActive('/my-bookings')">
                                <span class="nav-icon">📅</span>
                                <span>Mes réservations</span>
                            </a>
                        }
                        
                        <!-- 👔 PROPRIÉTAIRE -->
                        @if (role() === 'owner') {
                            <a routerLink="/my-properties" class="nav-link" [class.active]="isActive('/my-properties')">
                                <span class="nav-icon">🏠</span>
                                <span>Mes logements</span>
                            </a>
                            <a routerLink="/owner-bookings" class="nav-link" [class.active]="isActive('/owner-bookings')">
                                <span class="nav-icon">📋</span>
                                <span>Réservations reçues</span>
                            </a>
                        }
                        
                        <!-- 👑 ADMIN -->
                        @if (role() === 'admin') {
                            <a routerLink="/dashboard" class="nav-link" [class.active]="isActive('/dashboard')">
                                <span class="nav-icon">📊</span>
                                <span>Dashboard</span>
                            </a>
                        }

                        <!-- 🤖 AI PRICE - For ALL logged-in users -->
                        @if (role() == 'owner') {
                        <a routerLink="/ai-price" class="nav-link" [class.active]="isActive('/ai-price')">
                            <span class="nav-icon">🤖</span>
                            <span>Prix IA</span>
                        </a>
                        }

                        <!-- 👤 BOUTON PROFIL SIMPLIFIÉ -->
                        <button class="profile-btn" (click)="logout()">
                            <span class="avatar">{{ getInitials() }}</span>
                            <span class="profile-name">{{ getDisplayName() }}</span>
                            <span class="logout-icon">🚪</span>
                        </button>
                    } @else {
                        <!-- Non connecté -->
                        <a routerLink="/auth/login" class="btn-login">
                            <span>🔐</span> Se connecter
                        </a>
                        <a routerLink="/auth/register" class="btn-register">
                            ✨ S'inscrire
                        </a>
                    }
                </nav>
            </div>
        </header>
    `,
    styles: [`
        /* 🌟 HEADER */
        .header-container {
            background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
            border-bottom: 2px solid rgba(255, 107, 157, 0.12);
            padding: 0.7rem 2rem;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(255, 107, 157, 0.06);
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1.5rem;
        }

        /* 🏠 LOGO */
        .logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            text-decoration: none;
            transition: transform 0.3s ease;
            flex-shrink: 0;
        }

        .logo:hover {
            transform: scale(1.03);
        }

        .logo-icon {
            font-size: 1.8rem;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        .logo-text {
            font-size: 1.3rem;
            font-weight: 700;
            color: #2d1b69;
            letter-spacing: -0.5px;
        }

        .logo-highlight {
            color: #ff6b6b;
            margin-left: 0.2rem;
        }

        /* 📋 NAVIGATION */
        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            flex-wrap: wrap;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            text-decoration: none;
            color: #666;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
            transform: translateY(-2px);
        }

        .nav-link.active {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.25);
        }

        .nav-link.active .nav-icon {
            color: white;
        }

        .nav-icon {
            font-size: 1rem;
        }

        /* 👤 PROFIL SIMPLIFIÉ */
        .profile-btn {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.25rem 0.8rem 0.25rem 0.25rem;
            border: 2px solid rgba(255, 107, 157, 0.15);
            border-radius: 50px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .profile-btn:hover {
            border-color: #ff6b6b;
            box-shadow: 0 4px 15px rgba(255, 107, 157, 0.12);
            transform: translateY(-2px);
        }

        .avatar {
            width: 2.2rem;
            height: 2.2rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.85rem;
        }

        .profile-name {
            font-weight: 600;
            color: #2d1b69;
            font-size: 0.85rem;
        }

        .logout-icon {
            font-size: 1rem;
            color: #888;
            transition: transform 0.3s ease;
        }

        .profile-btn:hover .logout-icon {
            transform: translateX(3px);
        }

        /* 🔐 BOUTONS AUTH */
        .btn-login {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            text-decoration: none;
            color: #666;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .btn-login:hover {
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
        }

        .btn-register {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            text-decoration: none;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.25);
        }

        .btn-register:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(238, 90, 36, 0.35);
        }

        /* 📱 RESPONSIVE */
        @media (max-width: 992px) {
            .header-container {
                padding: 0.6rem 1rem;
            }

            .profile-name {
                display: none;
            }

            .profile-btn {
                padding: 0.25rem;
            }

            .nav-link {
                padding: 0.4rem 0.8rem;
                font-size: 0.85rem;
            }
        }

        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 0.6rem;
            }

            .nav-links {
                justify-content: center;
                width: 100%;
            }

            .logo-text {
                font-size: 1.1rem;
            }

            .logo-icon {
                font-size: 1.5rem;
            }

            .btn-register, .btn-login {
                padding: 0.3rem 0.8rem;
                font-size: 0.8rem;
            }

            .nav-link span:not(.nav-icon) {
                display: none;
            }

            .nav-link {
                padding: 0.4rem 0.6rem;
            }

            .nav-icon {
                font-size: 1.2rem;
            }
        }

        @media (max-width: 480px) {
            .header-container {
                padding: 0.4rem 0.6rem;
            }

            .nav-links {
                gap: 0.2rem;
            }

            .btn-register {
                padding: 0.2rem 0.6rem;
                font-size: 0.7rem;
            }

            .btn-login {
                padding: 0.2rem 0.6rem;
                font-size: 0.7rem;
            }
        }
    `]
})
export class Header {
    authService = inject(AuthService);
    router = inject(Router);

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    role(): string | null {
        return this.authService.getRole();
    }

    email(): string | null {
        return this.authService.getEmail();
    }

    getHomeRoute(): string {
        if (!this.isLoggedIn()) return '/properties';
        const role = this.role();
        if (role === 'owner') return '/my-properties';
        if (role === 'admin') return '/dashboard';
        return '/properties';
    }

    getInitials(): string {
        const email = this.email();
        if (email) {
            return email.charAt(0).toUpperCase();
        }
        return '👤';
    }

    getDisplayName(): string {
        const email = this.email();
        if (email) {
            return email.split('@')[0];
        }
        return 'Utilisateur';
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/properties']);
    }
}