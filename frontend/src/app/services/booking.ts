import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface BookingCreate {
    property_id: string;
    start_date: string;  // ISO string
    end_date: string;    // ISO string
}

export interface Booking {
    _id: string;
    property_id: string;
    property_title?: string;
    property_location?: string;
    user_id: string;
    start_date: string;
    end_date: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = 'http://127.0.0.1:8000/bookings';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private authHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    create(booking: BookingCreate): Observable<Booking> {
        return this.http.post<Booking>(`${this.apiUrl}/`, booking, { 
            headers: this.authHeaders() 
        });
    }

    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/my`, { 
            headers: this.authHeaders() 
        });
    }

    getOwnerBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/owner`, { 
            headers: this.authHeaders() 
        });
    }

    updateStatus(bookingId: string, status: string): Observable<Booking> {
        return this.http.put<Booking>(
            `${this.apiUrl}/${bookingId}/status?status=${status}`, 
            {}, 
            { headers: this.authHeaders() }
        );
    }
}