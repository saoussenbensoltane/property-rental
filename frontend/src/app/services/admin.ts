// src/app/services/admin.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
}

export interface Stats {
    total_users: number;
    total_owners: number;
    total_properties: number;
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://127.0.0.1:8000/admin';
    private authService = inject(AuthService);

    constructor(private http: HttpClient) {}

    private authHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, { headers: this.authHeaders() });
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.authHeaders() });
    }

    // ✅ CORRECTION : Le rôle doit être dans le BODY, pas dans l'URL
    updateUserRole(userId: string, role: string): Observable<any> {
        // Envoyer le rôle dans le body comme attendu par le backend
        const body = { role: role };
        return this.http.put(
            `${this.apiUrl}/users/${userId}/role`, 
            body,  // 👈 BODY avec le rôle
            { headers: this.authHeaders() }
        );
    }

    getAllProperties(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/properties`, { headers: this.authHeaders() });
    }

    deleteProperty(propertyId: string): Observable<any> {
        return this.http.delete(`http://127.0.0.1:8000/properties/admin/${propertyId}`, { headers: this.authHeaders() });
    }

    getStats(): Observable<Stats> {
        return this.http.get<Stats>(`${this.apiUrl}/stats`, { headers: this.authHeaders() });
    }
}