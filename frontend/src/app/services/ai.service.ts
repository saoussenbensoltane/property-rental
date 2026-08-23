// src/app/services/ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private apiUrl = 'http://127.0.0.1:8000/ai';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders() {
        const token = this.authService.getToken();
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }

    predictPrice(propertyId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/price-prediction/${propertyId}`, this.getHeaders());
    }

    getMarketInsights(): Observable<any> {
        return this.http.get(`${this.apiUrl}/market-insights`, this.getHeaders());
    }

    getPropertyValuation(propertyId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/property-valuation/${propertyId}`, this.getHeaders());
    }

    analyzePortfolio(): Observable<any> {
        return this.http.post(`${this.apiUrl}/analyze-portfolio`, {}, this.getHeaders());
    }

    getRecommendations(): Observable<any> {
        return this.http.get(`${this.apiUrl}/recommendations`, this.getHeaders());
    }

    getMarketPredictions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/market-predictions`, this.getHeaders());
    }
}