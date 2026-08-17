import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
    access_token: string;
    token_type: string;
    role: string;
    user_id: string;
}

interface ForgotPasswordResponse {
    message: string;
    temp_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000/auth';

    constructor(private http: HttpClient) {}

    login(email: string, password: string, rememberMe: boolean = true): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(response => {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('access_token', response.access_token);
                storage.setItem('role', response.role);
                storage.setItem('email', email);
                storage.setItem('user_id', response.user_id);
            })
        );
    }

    register(email: string, password: string, role: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/register`, { email, password, role }).pipe(
            tap(response => {
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('role', response.role);
                localStorage.setItem('email', email);
                localStorage.setItem('user_id', response.user_id);
            })
        );
    }

    forgotPassword(email: string): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email });
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
    }
}