// src/app/services/admin.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { AuthService } from './auth';
import { Booking } from './booking';

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
        // ✅ Vérifier que l'ID est valide
        if (!userId || userId === 'undefined' || userId === 'null') {
            return throwError(() => new Error('ID utilisateur invalide'));
        }
        return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.authHeaders() });
    }

    updateUserRole(userId: string, role: string): Observable<any> {
        // ✅ Vérifier que l'ID est valide
        if (!userId || userId === 'undefined' || userId === 'null') {
            return throwError(() => new Error('ID utilisateur invalide'));
        }
        
        const body = { role: role };
        return this.http.put(
            `${this.apiUrl}/users/${userId}/role`, 
            body,
            { headers: this.authHeaders() }
        );
    }

    getAllProperties(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/properties`, { headers: this.authHeaders() }).pipe(
            // ✅ S'assurer que chaque propriété a un _id
            map((properties) => {
                return properties.map(p => ({
                    ...p,
                    _id: p._id || p.id || p._id
                }));
            })
        );
    }

    deleteProperty(propertyId: string): Observable<any> {
        // ✅ Vérifier que l'ID est valide
        if (!propertyId || propertyId === 'undefined' || propertyId === 'null' || propertyId === '') {
            return throwError(() => new Error('ID de propriété invalide'));
        }
        
        console.log('🗑️ Suppression propriété ID:', propertyId);
        
        return this.http.delete(`http://127.0.0.1:8000/properties/admin/${propertyId}`, { 
            headers: this.authHeaders() 
        });
    }

    getStats(): Observable<Stats> {
        return this.http.get<Stats>(`${this.apiUrl}/stats`, { headers: this.authHeaders() });
    }

getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`, { headers: this.authHeaders() }).pipe(
        map((bookings: any[]) => bookings.map(b => ({
            ...b,
            _id: b._id || b.id
        })))
    );
}


}