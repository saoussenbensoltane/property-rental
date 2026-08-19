import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AdminService } from '../../../services/admin';
import { Header } from '@/app/shared/header';

@Component({
    selector: 'app-admin-properties',
    standalone: true,
    imports: [
        CommonModule, 
        TableModule, 
        ButtonModule, 
        ConfirmDialogModule, 
        ToastModule, 
        TooltipModule,
        TagModule,
        Header
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <app-header></app-header>

        <!-- 🌟 EN-TÊTE CUTE -->
        <div class="properties-header">
            <div class="header-content">
                <div class="header-left">
                    <span class="header-emoji">🏠</span>
                    <div>
                        <h1 class="header-title">Tous les logements</h1>
                        <p class="header-subtitle">✨ Gérez votre parc immobilier en un clin d'œil</p>
                    </div>
                </div>
                <div class="header-right">
                    <span class="property-count">📊 {{ properties().length }} logements</span>
                </div>
            </div>
        </div>

        <!-- 📋 TABLEAU DES LOGEMENTS -->
        <div class="table-container">
            <div class="table-wrapper">
                <p-table 
                    [value]="properties()" 
                    [paginator]="true" 
                    [rows]="10"
                    [rowsPerPageOptions]="[5, 10, 20, 50]"
                    responsiveLayout="scroll"
                    styleClass="custom-table"
                >
                    <ng-template #header>
                        <tr>
                            <th>📝 Titre</th>
                            <th>📍 Localisation</th>
                            <th>🏷️ Type</th>
                            <th>💰 Prix</th>
                            <th>⚡ Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-property>
                        <tr>
                            <td>
                                <div class="property-cell">
                                    <span class="property-title">{{ property.title }}</span>
                                    <span class="property-id" *ngIf="property.images && property.images.length > 0">📸</span>
                                </div>
                            </td>
                            <td>
                                <span class="location-badge">📍 {{ property.location }}</span>
                            </td>
                            <td>
                                <span class="type-tag" [ngClass]="getTypeClass(property.type)">
                                    {{ property.type }}
                                </span>
                            </td>
                            <td>
                                <span class="price-amount">{{ property.price | number }} <span class="price-currency">TND</span></span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <p-button 
                                        icon="pi pi-trash" 
                                        severity="danger" 
                                        size="small" 
                                        [rounded]="true" 
                                        [outlined]="true" 
                                        (onClick)="confirmRemove(property)" 
                                        pTooltip="Supprimer"
                                        [style]="{ 'transition': 'all 0.3s ease' }"
                                    ></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="5" class="empty-state">
                                <span class="empty-emoji">🏠</span>
                                <p class="empty-title">Aucun logement disponible</p>
                                <p class="empty-subtitle">✨ Les premiers logements arrivent bientôt !</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        /* 🌟 EN-TÊTE */
        .properties-header {
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
        }

        .property-count {
            color: #888;
            font-size: 0.9rem;
            background: white;
            padding: 0.4rem 1.2rem;
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            font-weight: 500;
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
            border-bottom: 1px solid #f8f8f8;
            transition: all 0.2s ease;
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

        ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page {
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page:hover {
            background: #fef5f7;
        }

        .property-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .property-title {
            font-weight: 500;
            color: #2d1b69;
        }

        .property-id {
            font-size: 0.8rem;
            color: #888;
        }

        .location-badge {
            background: #f0f7ff;
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.85rem;
            color: #4a90d9;
            display: inline-block;
        }

        .type-tag {
            padding: 0.2rem 0.8rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
        }

        .type-tag.appartement {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #3b82f6;
        }

        .type-tag.villa {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #00b894;
        }

        .type-tag.maison {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #d97706;
        }

        .type-tag.studio {
            background: linear-gradient(135deg, #fce7f3, #fbcfe8);
            color: #db2777;
        }

        .type-tag.default {
            background: #f0f0f0;
            color: #666;
        }

        .price-amount {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2d1b69;
        }

        .price-currency {
            font-size: 0.85rem;
            font-weight: 600;
            color: #ff6b6b;
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

        /* 🎨 ÉTAT VIDE */
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
            color: #2d1b69;
            margin: 0.5rem 0;
        }

        .empty-subtitle {
            color: #888;
            font-size: 1rem;
            margin: 0;
        }

        /* 📱 RESPONSIVE */
        @media (max-width: 768px) {
            .properties-header {
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
                justify-content: flex-start;
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
        }

        @media (max-width: 480px) {
            .property-cell {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.2rem;
            }

            .action-buttons {
                flex-direction: column;
                gap: 0.3rem;
            }
        }
    `]
})
export class AdminProperties {
    properties = signal<any[]>([]);
    adminService = inject(AdminService);
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);

    ngOnInit() {
        this.load();
    }

    load() {
        this.adminService.getAllProperties().subscribe({
            next: (data) => {
                this.properties.set(data);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger les logements'
                });
            }
        });
    }

    confirmRemove(property: any) {
        this.confirmationService.confirm({
            message: `💭 Voulez-vous vraiment supprimer le logement "${property.title}" ?`,
            header: '🗑️ Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '🗑️ Supprimer',
            rejectLabel: '❤️ Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-rounded',
            rejectButtonStyleClass: 'p-button-text p-button-rounded',
            accept: () => this.removeProperty(property._id, property.title)
        });
    }

    removeProperty(propertyId: string, title: string) {
        this.adminService.deleteProperty(propertyId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Supprimé',
                    detail: `"${title}" a été supprimé avec succès ✨`
                });
                this.load();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de supprimer le logement'
                });
            }
        });
    }

    getTypeClass(type: string): string {
        const types: Record<string, string> = {
            'appartement': 'appartement',
            'villa': 'villa',
            'maison': 'maison',
            'studio': 'studio'
        };
        return types[type.toLowerCase()] || 'default';
    }
}