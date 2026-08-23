import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BookingService, Booking } from '../../services/booking';
import { AuthService } from '../../services/auth';
import { Header } from '../../shared/header';
import { Router } from '@angular/router';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [
        CommonModule, 
        TableModule, 
        TagModule, 
        CardModule,
        ButtonModule,
        ToastModule,
        Header
    ],
    providers: [MessageService],
    template: `
        <!-- TOAST POUR LES NOTIFICATIONS -->
        <p-toast position="top-center" [baseZIndex]="9999"></p-toast>

        <app-header></app-header>

        <!-- 🌟 EN-TÊTE CUTE -->
        <div class="bookings-header">
            <div class="header-content">
                <div class="header-left">
                    <span class="header-emoji">📅</span>
                    <div>
                        <h1 class="header-title">Mes réservations</h1>
                        <p class="header-subtitle">✨ Gérez vos séjours de rêve en un clin d'œil</p>
                    </div>
                </div>
                <div class="header-right">
                    <span class="booking-count">📊 {{ bookings().length }} réservations</span>
                    <div class="status-stats">
                        <span class="stat-badge pending">⏳ {{ getStatusCount('pending') }}</span>
                        <span class="stat-badge confirmed">✅ {{ getStatusCount('confirmed') }}</span>
                        <span class="stat-badge cancelled">❌ {{ getStatusCount('cancelled') }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 📋 TABLEAU DES RÉSERVATIONS -->
        <div class="table-container">
            @if (bookings().length === 0) {
                <!-- État vide "cute" -->
                <div class="empty-state">
                    <span class="empty-emoji">🏠</span>
                    <h2 class="empty-title">Pas encore de réservation</h2>
                    <p class="empty-text">💭 C'est le moment de rêver ! Découvrez des logements uniques ✨</p>
                    <button class="btn-explore" (click)="goToProperties()">
                        🌟 Explorer les logements
                    </button>
                </div>
            } @else {
                <!-- TABLEAU -->
                <div class="table-wrapper">
                    <p-table 
                        [value]="bookings()" 
                        [paginator]="true" 
                        [rows]="5" 
                        [rowsPerPageOptions]="[5, 10, 20]"
                        responsiveLayout="scroll"
                        styleClass="custom-table"
                    >
                        <ng-template #header>
                            <tr>
                                <th>🏠 Logement</th>
                                <th>📅 Arrivée</th>
                                <th>📅 Départ</th>
                                <th>📊 Statut</th>
                            </tr>
                        </ng-template>
                        
                        <ng-template #body let-booking>
                            <tr>
                                <td class="property-cell">
                                    <span class="property-icon">🏠</span>
                                    <div class="property-info">
                                        <!-- ✅ AFFICHER LE NOM DU LOGEMENT -->
                                        <span class="property-name">
                                            {{ booking.property_title || booking.property_id }}
                                        </span>
                                        <!-- ✅ AFFICHER LA LOCALISATION -->
                                        <span class="property-location" *ngIf="booking.property_location">
                                            📍 {{ booking.property_location }}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span class="date-badge">{{ booking.start_date | date: 'dd/MM/yyyy' }}</span>
                                </td>
                                <td>
                                    <span class="date-badge">{{ booking.end_date | date: 'dd/MM/yyyy' }}</span>
                                </td>
                                <td>
                                    <span class="status-tag" [ngClass]="booking.status">
                                        {{ getStatusLabel(booking.status) }}
                                    </span>
                                </td>
                            </tr>
                        </ng-template>
                        
                        <ng-template #emptymessage>
                            <tr>
                                <td colspan="4" class="text-center py-4">
                                    <span class="text-2xl">🏠</span>
                                    <p class="mt-2">💭 Pas encore de réservation... C'est le moment de rêver ✨</p>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            }
        </div>
    `,
    styles: [`
        /* 🌟 EN-TÊTE */
        .bookings-header {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%);
            border-radius: 20px;
            margin: 1.5rem;
            padding: 1.5rem 2rem;
            box-shadow: 0 4px 20px rgba(255, 107, 157, 0.12);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .header-left {
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
            color: #2d1b69;
            margin: 0;
        }

        .header-subtitle {
            color: #888;
            font-size: 1.1rem;
            margin: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .booking-count {
            color: #555;
            font-size: 0.9rem;
            background: white;
            padding: 0.4rem 1.2rem;
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            font-weight: 500;
        }

        .status-stats {
            display: flex;
            gap: 0.5rem;
        }

        .stat-badge {
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .stat-badge.pending {
            background: #fef3c7;
            color: #d97706;
        }

        .stat-badge.confirmed {
            background: #d1fae5;
            color: #00b894;
        }

        .stat-badge.cancelled {
            background: #fee2e2;
            color: #ef4444;
        }

        /* 📋 TABLEAU */
        .table-container {
            margin: 0 1.5rem 1.5rem;
        }

        .table-wrapper {
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        ::ng-deep .custom-table .p-datatable-wrapper {
            border-radius: 12px;
            overflow: hidden;
        }

        ::ng-deep .custom-table .p-datatable-thead > tr > th {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%);
            color: #2d1b69;
            font-weight: 600;
            padding: 1rem 1.2rem;
            border: none;
            font-size: 0.95rem;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr {
            transition: background 0.3s ease;
            border-bottom: 1px solid #f8f8f8;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr:hover {
            background: #fef5f7;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr > td {
            padding: 1rem 1.2rem;
            border: none;
            vertical-align: middle;
        }

        ::ng-deep .custom-table .p-paginator {
            background: transparent;
            border: none;
            padding-top: 1rem;
        }

        ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            border-radius: 50%;
        }

        .property-cell {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .property-icon {
            font-size: 1.5rem;
        }

        .property-info {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        .property-name {
            font-weight: 600;
            color: #2d1b69;
            font-size: 1rem;
        }

        .property-location {
            font-size: 0.8rem;
            color: #888;
            background: #f5f5f5;
            padding: 0.1rem 0.6rem;
            border-radius: 12px;
            display: inline-block;
            width: fit-content;
        }

        .date-badge {
            background: #f5f5f5;
            padding: 0.3rem 1rem;
            border-radius: 50px;
            font-size: 0.9rem;
            color: #555;
            display: inline-block;
        }

        /* 🏷️ STATUTS */
        .status-tag {
            padding: 0.3rem 1.2rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
        }

        .status-tag.pending {
            background: #fef3c7;
            color: #d97706;
        }

        .status-tag.confirmed {
            background: #d1fae5;
            color: #00b894;
        }

        .status-tag.cancelled {
            background: #fee2e2;
            color: #ef4444;
        }

        /* 🎨 ÉTAT VIDE */
        .empty-state {
            background: white;
            border-radius: 20px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .empty-emoji {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
        }

        .empty-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d1b69;
            margin-bottom: 0.5rem;
        }

        .empty-text {
            color: #888;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        .btn-explore {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.8rem 2.5rem;
            border-radius: 50px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
        }

        .btn-explore:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(238, 90, 36, 0.4);
        }

        /* 📱 RESPONSIVE */
        @media (max-width: 768px) {
            .bookings-header {
                margin: 1rem;
                padding: 1.5rem;
            }

            .header-title {
                font-size: 1.5rem;
            }

            .header-emoji {
                font-size: 2.5rem;
            }

            .header-content {
                flex-direction: column;
                align-items: flex-start;
            }

            .header-right {
                width: 100%;
                flex-direction: column;
                align-items: flex-start;
            }

            .status-stats {
                width: 100%;
                justify-content: flex-start;
                flex-wrap: wrap;
            }

            .table-container {
                margin: 0 1rem 1rem;
            }

            .table-wrapper {
                padding: 1rem;
                overflow-x: auto;
            }

            ::ng-deep .custom-table .p-datatable-tbody > tr > td,
            ::ng-deep .custom-table .p-datatable-thead > tr > th {
                padding: 0.6rem 0.8rem;
                font-size: 0.85rem;
            }

            .property-cell {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.3rem;
            }

            .property-icon {
                font-size: 1.2rem;
            }
        }

        @media (max-width: 480px) {
            .property-cell {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.2rem;
            }
        }
    `]
})
export class MyBookings {
    bookings = signal<Booking[]>([]);
    bookingService = inject(BookingService);
    authService = inject(AuthService);
    router = inject(Router);
    private messageService = inject(MessageService);

    ngOnInit() {
        // Vérifier si l'utilisateur est connecté
        if (!this.authService.isLoggedIn()) {
            this.messageService.add({
                severity: 'warn',
                summary: '🔐 Connexion requise',
                detail: 'Connectez-vous pour voir vos réservations ✨',
                life: 4000
            });
            this.router.navigate(['/auth/login']);
            return;
        }

        this.loadBookings();
    }

    loadBookings() {
        this.bookingService.getMyBookings().subscribe({
            next: (data) => {
                this.bookings.set(data);
                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: '💭 Pas de réservations',
                        detail: 'C\'est le moment de réserver votre prochain séjour ! ✨',
                        life: 4000
                    });
                }
            },
            error: (error) => {
                if (error.status === 401) {
                    this.messageService.add({
                        severity: 'error',
                        summary: '🔐 Session expirée',
                        detail: 'Veuillez vous reconnecter',
                        life: 4000
                    });
                    this.authService.logout();
                    this.router.navigate(['/auth/login']);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: '😊 Oups !',
                        detail: 'Impossible de charger vos réservations',
                        life: 4000
                    });
                }
            }
        });
    }

    // 📊 MÉTHODES POUR LES STATUTS
    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'pending': '⏳ En attente',
            'confirmed': '✅ Confirmée',
            'cancelled': '❌ Annulée'
        };
        return labels[status] || status;
    }

    getStatusClass(status: string): string {
        return status;
    }

    getStatusCount(status: string): number {
        return this.bookings().filter(b => b.status === status).length;
    }

    getConfirmedCount(): number {
        return this.bookings().filter(b => b.status === 'confirmed').length;
    }

    getPendingCount(): number {
        return this.bookings().filter(b => b.status === 'pending').length;
    }

    goToProperties() {
        this.router.navigate(['/properties']);
    }
}