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
                <span class="header-emoji">📅</span>
                <div>
                    <h1 class="header-title">Mes réservations</h1>
                    <p class="header-subtitle">✨ Gérez vos séjours de rêve en un clin d'œil</p>
                </div>
            </div>
            
            <!-- STATISTIQUES -->
            <div class="stats-container">
                <div class="stat-card">
                    <span class="stat-number">{{ bookings().length }}</span>
                    <span class="stat-label">🏠 Total</span>
                </div>
                <div class="stat-card confirmed">
                    <span class="stat-number">{{ getConfirmedCount() }}</span>
                    <span class="stat-label">✅ Confirmées</span>
                </div>
                <div class="stat-card pending">
                    <span class="stat-number">{{ getPendingCount() }}</span>
                    <span class="stat-label">⏳ En attente</span>
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
                                    <span class="property-name">{{ booking.property_id }}</span>
                                </td>
                                <td>
                                    <span class="date-badge">{{ booking.start_date | date: 'dd/MM/yyyy' }}</span>
                                </td>
                                <td>
                                    <span class="date-badge">{{ booking.end_date | date: 'dd/MM/yyyy' }}</span>
                                </td>
                                <td>
                                    <span class="status-tag" [ngClass]="getStatusClass(booking.status)">
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
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(255, 107, 157, 0.12);
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
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

        /* 📊 STATISTIQUES */
        .stats-container {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .stat-card {
            background: white;
            padding: 0.8rem 2rem;
            border-radius: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
            text-align: center;
            flex: 1;
            min-width: 100px;
            transition: transform 0.2s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
        }

        .stat-card.confirmed {
            border-left: 4px solid #00b894;
        }

        .stat-card.pending {
            border-left: 4px solid #fdcb6e;
        }

        .stat-number {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d1b69;
            display: block;
        }

        .stat-card.confirmed .stat-number {
            color: #00b894;
        }

        .stat-card.pending .stat-number {
            color: #fdcb6e;
        }

        .stat-label {
            font-size: 0.85rem;
            color: #888;
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

        /* Style PrimeNG Table */
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
            gap: 0.5rem;
        }

        .property-icon {
            font-size: 1.2rem;
        }

        .property-name {
            font-weight: 500;
            color: #2d1b69;
        }

        .date-badge {
            background: #f5f5f5;
            padding: 0.3rem 1rem;
            border-radius: 50px;
            font-size: 0.9rem;
            color: #555;
            display: inline-block;
        }

        /* 🏷️ STATUTS PERSONNALISÉS */
        .status-tag {
            padding: 0.3rem 1.2rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
        }

        .status-tag.confirmed {
            background: linear-gradient(135deg, #00b894, #00a381);
            color: white;
        }

        .status-tag.pending {
            background: linear-gradient(135deg, #fdcb6e, #f39c12);
            color: white;
        }

        .status-tag.cancelled {
            background: linear-gradient(135deg, #dfe6e9, #b2bec3);
            color: #636e72;
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

            .stats-container {
                gap: 0.5rem;
            }

            .stat-card {
                padding: 0.5rem 1rem;
                min-width: 70px;
            }

            .stat-number {
                font-size: 1.4rem;
            }

            .table-container {
                margin: 0 1rem 1rem;
            }

            .table-wrapper {
                padding: 1rem;
                overflow-x: auto;
            }

            .empty-state {
                padding: 2rem 1rem;
            }

            .empty-title {
                font-size: 1.4rem;
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