// src/app/pages/dashboard/components/notificationswidget.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule],
    template: `
        <div class="notif-card">
            <div class="notif-header">
                <span class="notif-title">📋 Réservations récentes</span>
                <span class="notif-count">{{ bookings.length }}</span>
            </div>

            <div class="notif-list">
                <div class="notif-item" *ngFor="let booking of bookings">
                    <div class="notif-icon" [ngClass]="booking.status">
                        <span>{{ getIcon(booking.status) }}</span>
                    </div>
                    <div class="notif-content">
                        <span class="notif-property">
                            {{ booking.property_title || booking.property_id }}
                        </span>
                        <span class="notif-date">
                            📅 {{ booking.start_date | date:'dd/MM/yyyy' }}
                            →
                            {{ booking.end_date | date:'dd/MM/yyyy' }}
                        </span>
                    </div>
                    <span class="notif-status" [ngClass]="booking.status">
                        {{ getStatusLabel(booking.status) }}
                    </span>
                </div>

                <div *ngIf="bookings.length === 0" class="empty-state">
                    <span class="empty-emoji">💭</span>
                    <span class="empty-text">Aucune réservation récente</span>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .notif-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            height: 100%;
        }

        .notif-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .notif-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d1b69;
        }

        .notif-count {
            background: #fef5f7;
            color: #ff6b6b;
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .notif-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: 300px;
            overflow-y: auto;
        }

        .notif-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.8rem 1rem;
            border-radius: 12px;
            background: #f8f9fa;
            transition: all 0.2s ease;
        }

        .notif-item:hover {
            background: #fef5f7;
            transform: translateX(4px);
        }

        .notif-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .notif-icon.confirmed {
            background: #d1fae5;
        }

        .notif-icon.pending {
            background: #fef3c7;
        }

        .notif-icon.cancelled {
            background: #f1f2f6;
        }

        .notif-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .notif-property {
            font-weight: 500;
            color: #2d1b69;
            font-size: 0.95rem;
        }

        .notif-date {
            font-size: 0.75rem;
            color: #888;
        }

        .notif-status {
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.2rem 0.6rem;
            border-radius: 50px;
            flex-shrink: 0;
        }

        .notif-status.confirmed {
            background: #d1fae5;
            color: #00b894;
        }

        .notif-status.pending {
            background: #fef3c7;
            color: #f39c12;
        }

        .notif-status.cancelled {
            background: #f1f2f6;
            color: #636e72;
        }

        .empty-state {
            text-align: center;
            padding: 2rem 0;
        }

        .empty-emoji {
            font-size: 2.5rem;
            display: block;
            margin-bottom: 0.5rem;
        }

        .empty-text {
            color: #888;
            font-size: 0.95rem;
        }
    `]
})
export class NotificationsWidget {
    @Input() bookings: any[] = [];

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'pending': '⏳ En attente',
            'confirmed': '✅ Confirmée',
            'cancelled': '❌ Annulée'
        };
        return labels[status] || status;
    }

    getIcon(status: string): string {
        const icons: Record<string, string> = {
            'pending': '⏳',
            'confirmed': '✅',
            'cancelled': '❌'
        };
        return icons[status] || '📋';
    }
}