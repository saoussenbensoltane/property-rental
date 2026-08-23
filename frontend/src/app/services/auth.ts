// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';  // ✅ AJOUT

// ============================================================
// 📦 DTO - Correspond au backend (UserCreate, UserLogin)
// ============================================================
export interface RegisterRequest {
    email: string;
    password: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    role: string;
    user_id: string;
}

export interface ForgotPasswordResponse {
    message: string;
    temp_password: string;
}

// ============================================================
// 🎯 SERVICE AUTH
// ============================================================
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000/auth';

    constructor(
        private http: HttpClient,
        private router: Router  // ✅ AJOUT
    ) {}

    // ✅ Login avec DTO LoginRequest + Redirection
    login(email: string, password: string, rememberMe: boolean = true): Observable<AuthResponse> {
        const body: LoginRequest = { email, password };
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
            tap(response => {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('access_token', response.access_token);
                storage.setItem('role', response.role);
                storage.setItem('email', email);
                storage.setItem('user_id', response.user_id);
                
                // ✅ Redirection automatique selon le rôle
                this.redirectAfterLogin(response.role);
            })
        );
    }

    // ✅ Register avec DTO RegisterRequest + Redirection
    register(email: string, password: string, role: string): Observable<AuthResponse> {
        const body: RegisterRequest = { email, password, role };
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
            tap(response => {
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('role', response.role);
                localStorage.setItem('email', email);
                localStorage.setItem('user_id', response.user_id);
                
                // ✅ Redirection automatique selon le rôle
                this.redirectAfterLogin(response.role);
            })
        );
    }

    // ✅ Méthode de redirection
    private redirectAfterLogin(role: string): void {
        if (role === 'owner') {
            this.router.navigate(['/my-properties']);
        } else if (role === 'admin') {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/properties']);
        }
    }

    forgotPassword(email: string): Observable<ForgotPasswordResponse> {
        const body = { email };
        return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, body);
    }

    isLoggedIn(): boolean {
        return !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
    }

    getToken(): string | null {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }

    getRole(): string | null {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }

    getEmail(): string | null {
        return localStorage.getItem('email') || sessionStorage.getItem('email');
    }

    getUserId(): string | null {
        return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('user_id');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('user_id');
        
        // ✅ Rediriger vers la page d'accueil après déconnexion
        this.router.navigate(['/properties']);
    }
}