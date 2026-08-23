// src/app/pages/ai-price/ai-price.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PropertyService, Property } from '../../services/property';
import { AIService } from '../../services/ai.service';
import { AuthService } from '../../services/auth';
import { Header } from '@/app/shared/header';

@Component({
    selector: 'app-ai-price',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        ProgressSpinnerModule,
        ToastModule,
        Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-header></app-header>

        <div class="ai-container">
            <!-- 🌟 EN-TÊTE -->
            <div class="ai-header">
                <div class="header-content">
                    <span class="header-emoji">🤖</span>
                    <div>
                        <h1 class="header-title">Prix Intelligent</h1>
                        <p class="header-subtitle">✨ Optimisez vos prix avec l'intelligence artificielle</p>
                    </div>
                </div>
            </div>

            <!-- 📊 SÉLECTION DU LOGEMENT -->
            <div class="selection-section">
                <h3>🏠 Choisissez un logement à analyser</h3>
                <div class="property-grid">
                    @for (property of properties(); track property._id) {
                        <div class="property-select-card" 
                             [class.selected]="selectedPropertyId === property._id"
                             (click)="selectProperty(property._id)">
                            <div class="property-select-info">
                                <span class="property-select-title">{{ property.title }}</span>
                                <span class="property-select-location">📍 {{ property.location }}</span>
                                <span class="property-select-price">💰 {{ property.price }} TND / nuit</span>
                            </div>
                            @if (selectedPropertyId === property._id) {
                                <span class="select-badge">✅</span>
                            }
                        </div>
                    } @empty {
                        <div class="empty-state">
                            <span class="empty-emoji">🏠</span>
                            <p>Vous n'avez pas encore de logement</p>
                            <button class="btn-add" routerLink="/add-property">➕ Ajouter un logement</button>
                        </div>
                    }
                </div>

                <button class="btn-analyze" (click)="analyzePrice()" 
                        [disabled]="!selectedPropertyId || isLoading">
                    <span *ngIf="!isLoading">🔮 Analyser avec l'IA</span>
                    <span *ngIf="isLoading">⏳ Analyse en cours...</span>
                </button>
            </div>

            <!-- 📈 RÉSULTATS -->
            @if (predictionResult) {
                <div class="results-section">
                    <div class="result-card">
                        <div class="result-header">
                            <span class="result-emoji">📊</span>
                            <h2>Analyse du prix</h2>
                        </div>

                        <div class="price-comparison">
                            <div class="price-box current">
                                <span class="price-label">💰 Prix actuel</span>
                                <span class="price-value">{{ predictionResult.current_price }} TND</span>
                            </div>
                            <div class="price-arrow">➡️</div>
                            <div class="price-box optimal">
                                <span class="price-label">🌟 Prix optimal</span>
                                <span class="price-value">{{ predictionResult.optimal_price }} TND</span>
                                <span class="price-confidence">🔒 {{ predictionResult.confidence }}% de confiance</span>
                            </div>
                        </div>

                        <div class="price-range">
                            <span class="range-label">💰 Fourchette recommandée</span>
                            <div class="range-bar">
                                <span class="range-min">{{ predictionResult.suggested_price_range.min }} TND</span>
                                <div class="range-track">
                                    <div class="range-fill" [style.width.%]="50"></div>
                                </div>
                                <span class="range-max">{{ predictionResult.suggested_price_range.max }} TND</span>
                            </div>
                        </div>

                        <div class="factors-grid">
                            <div class="factor-item">
                                <span class="factor-icon">📍</span>
                                <span class="factor-label">Localisation</span>
                                <span class="factor-value">{{ predictionResult.factors.location }}</span>
                            </div>
                            <div class="factor-item">
                                <span class="factor-icon">🏠</span>
                                <span class="factor-label">Type</span>
                                <span class="factor-value">{{ predictionResult.factors.type }}</span>
                            </div>
                            <div class="factor-item">
                                <span class="factor-icon">📅</span>
                                <span class="factor-label">Saison</span>
                                <span class="factor-value">{{ predictionResult.factors.season }}</span>
                            </div>
                            <div class="factor-item">
                                <span class="factor-icon">📈</span>
                                <span class="factor-label">Demande</span>
                                <span class="factor-value">{{ predictionResult.factors.demand }}</span>
                            </div>
                        </div>

                        <div class="recommendation-box">
                            <span class="recommendation-icon">💡</span>
                            <span class="recommendation-text">{{ predictionResult.recommendation }}</span>
                        </div>
                    </div>

                    <!-- 📊 MARKET INSIGHTS -->
                    <div class="insights-card">
                        <div class="insights-header">
                            <span class="insights-emoji">📊</span>
                            <h2>Insights du marché</h2>
                        </div>
                        <div class="insights-grid">
                            <div class="insight-item">
                                <span class="insight-value">{{ marketInsights?.total_properties || 0 }}</span>
                                <span class="insight-label">🏠 Logements total</span>
                            </div>
                            <div class="insight-item">
                                <span class="insight-value">{{ marketInsights?.average_price || 0 }} TND</span>
                                <span class="insight-label">💰 Prix moyen</span>
                            </div>
                            <div class="insight-item">
                                <span class="insight-value">{{ marketInsights?.min_price || 0 }} - {{ marketInsights?.max_price || 0 }}</span>
                                <span class="insight-label">📊 Fourchette de prix</span>
                            </div>
                        </div>
                        <div class="insight-advice">
                            <span class="advice-icon">💡</span>
                            <span>{{ marketInsights?.advice || 'Analyse du marché en cours...' }}</span>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .ai-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 1.5rem 2rem;
        }

        .ai-header {
            background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
            border-radius: 20px;
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(66, 133, 244, 0.12);
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .header-emoji {
            font-size: 3rem;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .header-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a237e;
            margin: 0;
        }

        .header-subtitle {
            color: #666;
            font-size: 1.1rem;
            margin: 0;
        }

        .selection-section {
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            margin-bottom: 2rem;
        }

        .selection-section h3 {
            margin: 0 0 1rem 0;
            color: #2d1b69;
        }

        .property-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }

        .property-select-card {
            padding: 1rem;
            border: 2px solid #e8e8e8;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .property-select-card:hover {
            border-color: #4a90d9;
            background: #f8faff;
        }

        .property-select-card.selected {
            border-color: #4a90d9;
            background: #e8f0fe;
        }

        .property-select-title {
            font-weight: 600;
            color: #2d1b69;
            display: block;
        }

        .property-select-location {
            font-size: 0.85rem;
            color: #666;
        }

        .property-select-price {
            font-size: 0.85rem;
            font-weight: 600;
            color: #ff6b6b;
        }

        .select-badge {
            font-size: 1.5rem;
        }

        .btn-analyze {
            width: 100%;
            padding: 0.8rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #4a90d9, #3b82f6);
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-analyze:hover:not(:disabled) {
            transform: scale(1.02);
        }

        .btn-analyze:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .results-section {
            display: grid;
            gap: 1.5rem;
        }

        .result-card, .insights-card {
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .result-header, .insights-header {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }

        .result-header h2, .insights-header h2 {
            margin: 0;
            color: #2d1b69;
        }

        .price-comparison {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1.5rem;
        }

        .price-box {
            text-align: center;
            padding: 1rem;
            border-radius: 12px;
            flex: 1;
        }

        .price-box.current {
            background: #f5f5f5;
        }

        .price-box.optimal {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        }

        .price-label {
            display: block;
            font-size: 0.85rem;
            color: #666;
        }

        .price-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d1b69;
        }

        .price-box.optimal .price-value {
            color: #00b894;
        }

        .price-confidence {
            font-size: 0.8rem;
            color: #888;
        }

        .price-arrow {
            font-size: 2rem;
            color: #888;
        }

        .price-range {
            margin-bottom: 1.5rem;
        }

        .range-label {
            display: block;
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        .range-bar {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .range-min, .range-max {
            font-size: 0.85rem;
            color: #666;
            font-weight: 500;
        }

        .range-track {
            flex: 1;
            height: 8px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }

        .range-fill {
            height: 100%;
            background: linear-gradient(135deg, #4a90d9, #3b82f6);
            border-radius: 10px;
        }

        .factors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .factor-item {
            text-align: center;
            padding: 0.8rem;
            background: #f8f9fa;
            border-radius: 12px;
        }

        .factor-icon {
            font-size: 1.5rem;
            display: block;
        }

        .factor-label {
            font-size: 0.8rem;
            color: #666;
            display: block;
        }

        .factor-value {
            font-weight: 600;
            color: #2d1b69;
        }

        .recommendation-box {
            background: #fef3c7;
            padding: 1rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .recommendation-icon {
            font-size: 1.5rem;
        }

        .recommendation-text {
            color: #2d1b69;
            font-weight: 500;
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .insight-item {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
        }

        .insight-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d1b69;
            display: block;
        }

        .insight-label {
            font-size: 0.85rem;
            color: #666;
        }

        .insight-advice {
            background: #f0f7ff;
            padding: 0.8rem 1rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: #2d1b69;
        }

        .advice-icon {
            font-size: 1.2rem;
        }

        .empty-state {
            text-align: center;
            padding: 2rem;
            color: #888;
        }

        .empty-emoji {
            font-size: 3rem;
            display: block;
            margin-bottom: 0.5rem;
        }

        .btn-add {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.6rem 2rem;
            border-radius: 50px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
            .property-grid {
                grid-template-columns: 1fr;
            }

            .price-comparison {
                flex-direction: column;
                gap: 0.5rem;
            }

            .price-arrow {
                transform: rotate(90deg);
            }

            .factors-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .insights-grid {
                grid-template-columns: 1fr;
            }

            .range-bar {
                flex-direction: column;
            }
        }
    `]
})
export class AIPrice implements OnInit {
    properties = signal<Property[]>([]);
    selectedPropertyId: string | null = null;
    isLoading = false;
    predictionResult: any = null;
    marketInsights: any = null;

    private propertyService = inject(PropertyService);
    private aiService = inject(AIService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.loadProperties();
        this.loadMarketInsights();
    }

    loadProperties() {
        const ownerId = this.authService.getUserId();
        if (!ownerId) {
            this.messageService.add({
                severity: 'warn',
                summary: '🔐 Connexion requise',
                detail: 'Connectez-vous pour voir vos logements'
            });
            return;
        }

        this.propertyService.getMyProperties().subscribe({
            next: (data) => {
                this.properties.set(data);
                if (data.length > 0) {
                    this.selectedPropertyId = data[0]._id;
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger vos logements'
                });
            }
        });
    }

    loadMarketInsights() {
        this.aiService.getMarketInsights().subscribe({
            next: (data) => {
                this.marketInsights = data;
            },
            error: () => {
                console.error('Erreur chargement insights');
            }
        });
    }

    selectProperty(propertyId: string) {
        this.selectedPropertyId = propertyId;
        this.predictionResult = null;
    }

    analyzePrice() {
        if (!this.selectedPropertyId) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Sélection requise',
                detail: 'Veuillez sélectionner un logement'
            });
            return;
        }

        this.isLoading = true;
        this.predictionResult = null;

        this.aiService.predictPrice(this.selectedPropertyId).subscribe({
            next: (data) => {
                this.predictionResult = data.prediction;
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: '🔮 Analyse terminée !',
                    detail: 'Découvrez le prix optimal pour votre logement'
                });
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible d\'analyser le prix'
                });
            }
        });
    }
}