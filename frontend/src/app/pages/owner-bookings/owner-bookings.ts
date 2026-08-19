// src/app/pages/owner-bookings/owner-bookings.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { BookingService, Booking } from '../../services/booking';
import { PropertyService, Property } from '../../services/property';
import { Header } from '@/app/shared/header';

interface BookingWithProperty extends Booking {
    property?: Property;
}

@Component({
    selector: 'app-owner-bookings',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        TagModule,
        ButtonModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        Header
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <app-header></app-header>

        <!-- EN-TETE CUTE -->
        <div class="bookings-header">
            <div class="header-content">
                <div class="header-left">
                    <span class="header-emoji">📋</span>
                    <div>
                        <h1 class="header-title">Réservations reçues</h1>
                        <p class="header-subtitle">✨ Gérez les demandes de réservation de vos logements</p>
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

        <!-- TABLEAU DES RESERVATIONS -->
        <div class="table-container">
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
                            <th>⚡ Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-booking>
                        <tr>
                            <td>
                                <div class="property-cell">
                                    <span class="property-icon">🏠</span>
                                    <span class="property-title">
                                        {{ booking.property?.title || 'Logement supprimé' }}
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
                            <td>
                                @if (booking.status === 'pending') {
                                    <div class="action-buttons">
                                        <p-button
                                            icon="pi pi-check"
                                            severity="success"
                                            size="small"
                                            [rounded]="true"
                                            [outlined]="true"
                                            (onClick)="confirmUpdate(booking, 'confirmed')"
                                            pTooltip="Confirmer"
                                        ></p-button>
                                        <p-button
                                            icon="pi pi-times"
                                            severity="danger"
                                            size="small"
                                            [rounded]="true"
                                            [outlined]="true"
                                            (onClick)="confirmUpdate(booking, 'cancelled')"
                                            pTooltip="Annuler"
                                        ></p-button>
                                    </div>
                                } @else {
                                    <span class="status-done">
                                        {{ booking.status === 'confirmed' ? '✅ Traité' : '❌ Annulé' }}
                                    </span>
                                }
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="5" class="empty-state">
                                <span class="empty-emoji">📭</span>
                                <p class="empty-title">Aucune réservation reçue</p>
                                <p class="empty-subtitle">✨ Les réservations apparaîtront ici quand vos logements seront réservés</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        .bookings-header {
            background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
            border-radius: 20px;
            margin: 1.5rem;
            padding: 1.5rem 2rem;
            box-shadow: 0 4px 20px rgba(66, 133, 244, 0.12);
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
            color: #1a237e;
            margin: 0;
        }

        .header-subtitle {
            color: #666;
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
            background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
            color: #1a237e;
            font-weight: 600;
            padding: 1rem 1.2rem;
            border: none;
            font-size: 0.95rem;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr {
            border-bottom: 1px solid #f8f8f8;
            transition: all 0.2s ease;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr:hover {
            background: #f0f7ff;
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
            background: linear-gradient(135deg, #4a90d9, #3b82f6);
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

        .property-title {
            font-weight: 500;
            color: #1a237e;
        }

        .date-badge {
            background: #f5f5f5;
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.85rem;
            color: #555;
            display: inline-block;
        }

        .status-tag {
            padding: 0.3rem 1rem;
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

        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }

        ::ng-deep .action-buttons .p-button {
            transition: all 0.3s ease !important;
        }

        ::ng-deep .action-buttons .p-button:hover {
            transform: scale(1.1);
        }

        .status-done {
            font-size: 0.85rem;
            color: #888;
        }

        .empty-state {
            text-align: center;
            padding: 3rem 0;
        }

        .empty-emoji {
            font-size: 3.5rem;
            display: block;
            margin-bottom: 0.5rem;
            animation: float 3s ease-in-out infinite;
        }

        .empty-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1a237e;
            margin: 0.5rem 0;
        }

        .empty-subtitle {
            color: #888;
            font-size: 1rem;
            margin: 0;
        }

        @media (max-width: 768px) {
            .bookings-header {
                margin: 1rem;
                padding: 1rem;
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

            .action-buttons {
                flex-direction: column;
                gap: 0.3rem;
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
export class OwnerBookings {
    bookings = signal<BookingWithProperty[]>([]);
    bookingService = inject(BookingService);
    propertyService = inject(PropertyService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        this.bookingService.getOwnerBookings().pipe(
            switchMap(bookings => {
                if (bookings.length === 0) {
                    return of([]);
                }
                const requests = bookings.map(booking =>
                    this.propertyService.getById(booking.property_id).pipe(
                        map(property => ({ ...booking, property })),
                        catchError(() => of({ ...booking, property: undefined }))
                    )
                );
                return forkJoin(requests);
            })
        ).subscribe({
            next: (result) => {
                this.bookings.set(result as BookingWithProperty[]);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger les réservations'
                });
            }
        });
    }

    confirmUpdate(booking: BookingWithProperty, status: string) {
        const action = status === 'confirmed' ? 'confirmer' : 'annuler';
        const emoji = status === 'confirmed' ? '✅' : '❌';
        const color = status === 'confirmed' ? 'success' : 'danger';
        const propertyTitle = booking.property?.title || 'Logement';
        const startDate = new Date(booking.start_date).toLocaleDateString('fr-FR');
        const endDate = new Date(booking.end_date).toLocaleDateString('fr-FR');

        this.confirmationService.confirm({
            message: `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">${emoji}</div>
                    <p style="font-size: 1.1rem; margin-bottom: 5px;">
                        Voulez-vous <strong>${action}</strong> cette réservation ?
                    </p>
                    <p style="font-size: 0.9rem; color: #666;">
                        "${propertyTitle}"
                    </p>
                    <p style="font-size: 0.100rem; color: #888;">
                        📅 ${startDate} → ${endDate}
                    </p>
                </div>
            `,
            header: `${action === 'confirmer' ? 'Confirmer' : 'Annuler'} la réservation`,
            icon: status === 'confirmed' ? 'pi-check-circle' : 'pi-times-circle',
            acceptLabel: status === 'confirmed' ? '✅ Confirmer' : ' oui',
            rejectLabel: '❌Annuler',
            acceptButtonStyleClass: `p-button-${color} p-button-rounded`,
            rejectButtonStyleClass: 'p-button-text p-button-rounded',
            accept: () => {
                this.updateStatus(booking._id, status);
            }
        });
    }

    updateStatus(bookingId: string, status: string) {
        const statusLabel = status === 'confirmed' ? 'confirmée' : 'annulée';

        this.bookingService.updateStatus(bookingId, status).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: status === 'confirmed' ? '✅ Réservation confirmée' : '❌ Réservation annulée',
                    detail: `La réservation a été ${statusLabel} avec succès ✨`
                });
                this.loadBookings();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de mettre à jour le statut'
                });
            }
        });
    }

    getStatusCount(status: string): number {
        return this.bookings().filter(b => b.status === status).length;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'pending': '⏳ En attente',
            'confirmed': '✅ Confirmée',
            'cancelled': '❌ Annulée'
        };
        return labels[status] || status;
    }
}