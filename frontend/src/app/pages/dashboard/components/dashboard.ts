import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';

// Services
import { AdminService } from '@/app/services/admin';
import { PropertyService, Property } from '@/app/services/property';
import { BookingService, Booking } from '@/app/services/booking';
import { StatsWidget } from './statswidget';

import { NotificationsWidget } from './notificationswidget';

import { Header } from '@/app/shared/header';
import { BestSellingWidget } from './bestsellingwidget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ToastModule,
        TableModule,
        ButtonModule,
        ProgressBarModule,
        ChartModule,
        StatsWidget,
        
        NotificationsWidget,
        Header
    ],
    providers: [MessageService],
    template: `
        <app-header></app-header>
        <p-toast position="top-center"></p-toast>

        <!-- 🌟 CARTE EN-TÊTE -->
        <div class="dashboard-grid">
            <div class="box box-header">
                <div class="header-content">
                    <div class="header-left">
                    
                        <span class="header-emoji">📊</span>
                        <div>
                            <h1 class="header-title">Tableau de Bord</h1>
                            <p class="header-subtitle">✨ Analysez vos performances en un clin d'œil</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <span class="update-time">🔄 {{ today | date:'HH:mm' }}</span>
                        <button class="btn-refresh" (click)="refreshData()">
                            🔄 Actualiser
                        </button>
                    </div>
                </div>
            </div>

            <!-- 📊 CARTE STATISTIQUES -->
            <div class="box box-stats">
                <app-stats-widget [stats]="statsData"></app-stats-widget>
            </div>

            <!-- 📈 CARTE GRAPHIQUE -->
            <div class="box box-chart">
                <div class="section-header">
                    <span class="section-title">📊 Réservations par mois</span>
                    <span class="section-count">Évolution</span>
                </div>
                <p-chart 
                    type="bar" 
                    [data]="chartData" 
                    [options]="chartOptions"
                    height="230px"
                ></p-chart>
            </div>

            <!-- 📋 CARTE RÉSERVATIONS RÉCENTES -->
            <div class="box box-notifications">
                <app-notifications-widget [bookings]="recentBookings"></app-notifications-widget>
            </div>

            <!-- 📊 CARTE STATUT RÉSERVATIONS -->
            <div class="box box-status">
                <div class="section-header">
                    <span class="section-title">📊 Statut des réservations</span>
                </div>

                <div class="status-item">
                    <span>✅ Confirmées</span>
                    <p-progressBar 
                        [value]="getConfirmationRate()" 
                        [style]="{'height': '10px'}"
                    ></p-progressBar>
                    <span class="status-percent">{{ getConfirmationRate() }}%</span>
                </div>

                <div class="status-item">
                    <span>⏳ En attente</span>
                    <p-progressBar 
                        [value]="getPendingRate()" 
                        [style]="{'height': '10px'}"
                    ></p-progressBar>
                    <span class="status-percent">{{ getPendingRate() }}%</span>
                </div>

                <div class="status-item">
                    <span>❌ Annulées</span>
                    <p-progressBar 
                        [value]="getCancelledRate()" 
                        [style]="{'height': '10px'}"
                    ></p-progressBar>
                    <span class="status-percent">{{ getCancelledRate() }}%</span>
                </div>

                <div class="status-summary">
                    <div class="summary-item">
                        <span>Total réservations</span>
                        <span class="summary-value">{{ totalBookings }}</span>
                    </div>
                    <div class="summary-item">
                        <span>Taux de conversion</span>
                        <span class="summary-value success">{{ getConversionRate() }}%</span>
                    </div>
                </div>
            </div>

            <!-- 👥 CARTE UTILISATEURS -->
            <div class="box box-users">
                <div class="section-header">
                    <span class="section-title">👥 Utilisateurs</span>
                    <span class="section-count">{{ users.length }}</span>
                </div>
                <p-table [value]="users" [paginator]="true" [rows]="5" styleClass="custom-table">
                    <ng-template #header>
                        <tr>
                            <th>📧 Email</th>
                            <th>🎭 Rôle</th>
                            <th>⚡ Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-user>
                        <tr>
                            <td>{{ user.email }}</td>
                            <td><span class="role-tag" [ngClass]="user.role">{{ user.role }}</span></td>
                            <td>
                                <button class="btn-action" (click)="changeRole(user)">
                                    🔄 Changer rôle
                                </button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- 🏠 CARTE LOGEMENTS -->
            <div class="box box-properties">
                <div class="section-header">
                    <span class="section-title">🏠 Logements</span>
                    <span class="section-count">{{ properties.length }}</span>
                </div>
                <p-table [value]="properties" [paginator]="true" [rows]="5" styleClass="custom-table">
                    <ng-template #header>
                        <tr>
                            <th>📝 Titre</th>
                            <th>📍 Localisation</th>
                            <th>💰 Prix</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-property>
                        <tr>
                            <td>{{ property.title }}</td>
                            <td>{{ property.location }}</td>
                            <td>{{ property.price }} DT</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        /* 🧱 GRILLE PRINCIPALE : chaque section est une "case" distincte */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1.5rem;
            padding: 1.5rem;
        }

        .box {
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
        }

        .box-header {
            grid-column: span 12;
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%);
            box-shadow: 0 4px 20px rgba(255, 107, 157, 0.12);
        }

        .box-stats {
            grid-column: span 12;
            padding: 0;
            background: transparent;
            box-shadow: none;
        }

        .box-chart {
            grid-column: span 7;
        }

        .box-notifications {
            grid-column: span 5;
        }

        .box-status {
            grid-column: span 5;
        }

        .box-users {
            grid-column: span 7;
        }

        .box-properties {
            grid-column: span 5;
        }

        @media (max-width: 1200px) {
            .box-chart, .box-notifications, .box-status, .box-users, .box-properties {
                grid-column: span 12;
            }
        }

        /* 🌟 EN-TÊTE */
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
        }

        .update-time {
            color: #888;
            font-size: 0.9rem;
        }

        .btn-refresh {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-refresh:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d1b69;
        }

        .section-count {
            font-size: 0.9rem;
            color: #888;
        }

        .status-item {
            margin-bottom: 1rem;
        }

        .status-item > span:first-child {
            display: block;
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
            color: #555;
        }

        .status-percent {
            float: right;
            font-weight: 600;
            color: #2d1b69;
        }

        ::ng-deep .status-item .p-progressbar {
            border-radius: 10px;
            overflow: hidden;
        }

        .status-summary {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #f0f0f0;
        }

        .summary-item {
            flex: 1;
            text-align: center;
        }

        .summary-item span:first-child {
            display: block;
            font-size: 0.8rem;
            color: #888;
        }

        .summary-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #2d1b69;
        }

        .summary-value.success {
            color: #00b894;
        }

        ::ng-deep .custom-table .p-datatable-thead > tr > th {
            background: #f8f9fa;
            color: #2d1b69;
            font-weight: 600;
            padding: 0.8rem 1rem;
            border: none;
        }

        ::ng-deep .custom-table .p-datatable-tbody > tr > td {
            padding: 0.8rem 1rem;
            border: none;
        }

        .role-tag {
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .role-tag.admin { background: #fef3c7; color: #f39c12; }
        .role-tag.owner { background: #dbeafe; color: #3b82f6; }
        .role-tag.user { background: #d1fae5; color: #00b894; }

        .btn-action {
            background: #f0f0f0;
            border: none;
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .btn-action:hover {
            background: #ff6b6b;
            color: white;
        }

        @media (max-width: 768px) {
            .dashboard-grid {
                padding: 1rem;
                gap: 1rem;
            }
            .box {
                padding: 1rem;
            }
            .header-title {
                font-size: 1.5rem;
            }
            .header-emoji {
                font-size: 2.5rem;
            }
        }
    `]
})
export class Dashboard implements OnInit {
    private adminService = inject(AdminService);
    private propertyService = inject(PropertyService);
    private bookingService = inject(BookingService);
    private messageService = inject(MessageService);

    users: any[] = [];
    properties: Property[] = [];
    bookings: Booking[] = [];
    today = new Date();

    totalUsers = 0;
    totalOwners = 0;
    totalProperties = 0;
    totalBookings = 0;
    pendingBookings = 0;
    confirmedBookings = 0;

    chartData: any;
    chartOptions: any;
    statsData: any[] = [];
    recentBookings: any[] = [];

    ngOnInit() {
        this.initChartOptions();
        this.loadAllData();
    }

    initChartOptions() {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        this.chartData = {
            labels: months,
            datasets: [
                {
                    label: '📅 Réservations',
                    data: Array(12).fill(0),
                    backgroundColor: 'rgba(255, 107, 157, 0.6)',
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { family: 'Lato, sans-serif' },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        font: { family: 'Lato, sans-serif' }
                    }
                },
                x: {
                    ticks: {
                        font: { family: 'Lato, sans-serif' }
                    }
                }
            }
        };
    }

    loadAllData() {
        this.adminService.getUsers().subscribe({
            next: (data) => {
                this.users = data || [];
                this.totalUsers = this.users.length;
                this.totalOwners = this.users.filter(u => u.role === 'owner').length;
                this.updateStats();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger les utilisateurs'
                });
            }
        });

        this.propertyService.getAll().subscribe({
            next: (data) => {
                this.properties = data || [];
                this.totalProperties = this.properties.length;
                this.updateStats();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger les propriétés'
                });
            }
        });

        this.bookingService.getMyBookings().subscribe({
            next: (data) => {
                this.bookings = data || [];
                this.totalBookings = this.bookings.length;
                this.pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
                this.confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
                this.recentBookings = this.bookings.slice(0, 5);
                this.updateStats();
                this.updateChartData();
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

    updateStats() {
        this.statsData = [
            { icon: '👤', value: this.totalUsers, label: 'Utilisateurs', color: '#dbeafe' },
            { icon: '👑', value: this.totalOwners, label: 'Propriétaires', color: '#d1fae5' },
            { icon: '🏠', value: this.totalProperties, label: 'Logements', color: '#fef3c7' },
            { icon: '📅', value: this.totalBookings, label: 'Réservations', color: '#fce7f3' },
            { icon: '⏳', value: this.pendingBookings, label: 'En attente', color: '#ede9fe' },
            { icon: '✅', value: this.confirmedBookings, label: 'Confirmées', color: '#d1fae5' }
        ];
    }

    updateChartData() {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData = Array(12).fill(0);

        this.bookings.forEach(booking => {
            if (booking.start_date) {
                const date = new Date(booking.start_date);
                const month = date.getMonth();
                monthlyData[month]++;
            }
        });

        this.chartData = {
            labels: months,
            datasets: [
                {
                    label: '📅 Réservations',
                    data: monthlyData,
                    backgroundColor: 'rgba(255, 107, 157, 0.6)',
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        };
    }

    refreshData() {
        this.messageService.add({
            severity: 'info',
            summary: '🔄 Actualisation',
            detail: 'Mise à jour des données en cours... ✨'
        });
        this.loadAllData();
    }

    getConfirmationRate(): number {
        if (this.totalBookings === 0) return 0;
        return Math.round((this.confirmedBookings / this.totalBookings) * 100);
    }

    getPendingRate(): number {
        if (this.totalBookings === 0) return 0;
        return Math.round((this.pendingBookings / this.totalBookings) * 100);
    }

    getCancelledRate(): number {
        if (this.totalBookings === 0) return 0;
        const cancelled = this.totalBookings - this.confirmedBookings - this.pendingBookings;
        return Math.round((cancelled / this.totalBookings) * 100);
    }

    getConversionRate(): number {
        if (this.totalProperties === 0) return 0;
        return Math.round((this.totalBookings / (this.totalProperties * 10)) * 100);
    }

    changeRole(user: any) {
        const roles = ['user', 'owner', 'admin'];
        const currentIndex = roles.indexOf(user.role);
        const nextRole = roles[(currentIndex + 1) % roles.length];

        this.adminService.updateUserRole(user._id, nextRole).subscribe({
            next: () => {
                user.role = nextRole;
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Rôle changé',
                    detail: `L'utilisateur est maintenant ${nextRole} ✨`
                });
                this.updateStats();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de changer le rôle'
                });
            }
        });
    }
}