import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
    private apiUrl = 'http://127.0.0.1:8000/properties';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Property[]> {
        return this.http.get<Property[]>(`${this.apiUrl}/`);
    }

    getById(id: string): Observable<Property> {
        return this.http.get<Property>(`${this.apiUrl}/${id}`);
    }

    create(property: Partial<Property>): Observable<Property> {
        return this.http.post<Property>(`${this.apiUrl}/`, property, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
    }



    uploadImage(propertyId: string, file: File): Observable<{ image_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ image_url: string }>(`${this.apiUrl}/${propertyId}/upload-image`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
}


getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
}

update(id: string, property: any): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, property, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
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