// src/app/services/property.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    type: string;
    owner_id: string;
    images: string[];
    created_at: string;
    average_rating: number;   // ✅ snake_case to match backend
    review_count: number;     // ✅ snake_case to match backend
}

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    // ✅ Use proxy path
  private apiUrl = 'http://127.0.0.1:8000/properties';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getAll(): Observable<Property[]> {
        return this.http.get<Property[]>(`${this.apiUrl}/`);
    }

    getById(id: string): Observable<Property> {
        return this.http.get<Property>(`${this.apiUrl}/${id}`);
    }

    create(property: Partial<Property>): Observable<Property> {
        return this.http.post<Property>(`${this.apiUrl}/`, property, {
            headers: this.getHeaders()
        });
    }

    uploadImage(propertyId: string, file: File): Observable<{ image_url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ image_url: string }>(
            `${this.apiUrl}/${propertyId}/upload-image`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`
                }
            }
        );
    }

    getMyProperties(): Observable<Property[]> {
        return this.http.get<Property[]>(`${this.apiUrl}/mine/list`, {
            headers: this.getHeaders()
        });
    }

    update(id: string, property: any): Observable<Property> {
        return this.http.put<Property>(`${this.apiUrl}/${id}`, property, {
            headers: this.getHeaders()
        });
    }

    deleteProperty(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    search(location?: string, type?: string, priceMin?: number, priceMax?: number): Observable<Property[]> {
        let params = new URLSearchParams();
        if (location) params.append('location', location);
        if (type) params.append('type', type);
        if (priceMin != null) params.append('price_min', priceMin.toString());
        if (priceMax != null) params.append('price_max', priceMax.toString());

        return this.http.get<Property[]>(`${this.apiUrl}/?${params.toString()}`);
    }
}