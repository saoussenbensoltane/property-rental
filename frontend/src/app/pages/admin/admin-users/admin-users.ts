import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../services/admin';
import { TooltipModule } from 'primeng/tooltip';
import { Header } from '@/app/shared/header';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        TableModule, 
        TagModule, 
        ButtonModule, 
        SelectModule, 
        ConfirmDialogModule, 
        ToastModule, 
        TooltipModule,
        Header
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <app-header></app-header>

        <!-- 🌟 EN-TÊTE CUTE -->
        <div class="users-header">
            <div class="header-content">
                <div class="header-left">
                    <span class="header-emoji">👥</span>
                    <div>
                        <h1 class="header-title">Gestion des utilisateurs</h1>
                        <p class="header-subtitle">✨ Gérez les comptes et les rôles de vos utilisateurs</p>
                    </div>
                </div>
                <div class="header-right">
                    <span class="user-count">👤 {{ users().length }} utilisateurs</span>
                    <div class="user-stats">
                        <span class="stat-badge admin">👑 {{ getRoleCount('admin') }}</span>
                        <span class="stat-badge owner">👔 {{ getRoleCount('owner') }}</span>
                        <span class="stat-badge user">👤 {{ getRoleCount('user') }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 📋 TABLEAU DES UTILISATEURS -->
        <div class="table-container">
            <div class="table-wrapper">
                <p-table 
                    [value]="users()" 
                    [paginator]="true" 
                    [rows]="10"
                    [rowsPerPageOptions]="[5, 10, 20, 50]"
                    responsiveLayout="scroll"
                    styleClass="custom-table"
                >
                    <ng-template #header>
                        <tr>
                            <th>📧 Email</th>
                            <th>🎭 Rôle</th>
                            <th>⚡ Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-user>
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <span class="user-avatar">{{ getAvatar(user.email) }}</span>
                                    <span class="user-email">{{ user.email }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="role-tag" [ngClass]="user.role">
                                    {{ getRoleLabel(user.role) }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <!-- Sélecteur de rôle -->
                                    <p-select 
                                        [(ngModel)]="user.newRole" 
                                        [options]="roleOptions" 
                                        placeholder="🎯 Changer rôle" 
                                        styleClass="role-select"
                                        [style]="{'min-width': '130px'}"
                                    ></p-select>
                                    
                                    <!-- Bouton Appliquer -->
                                    <p-button 
                                        icon="pi pi-check" 
                                        severity="success" 
                                        size="small" 
                                        [rounded]="true" 
                                        [outlined]="true" 
                                        (onClick)="changeRole(user)" 
                                        pTooltip="Appliquer le rôle"
                                    ></p-button>
                                    
                                    <!-- Bouton Supprimer -->
                                    <p-button 
                                        icon="pi pi-trash" 
                                        severity="danger" 
                                        size="small" 
                                        [rounded]="true" 
                                        [outlined]="true" 
                                        (onClick)="confirmRemove(user)" 
                                        pTooltip="Supprimer"
                                    ></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="3" class="empty-state">
                                <span class="empty-emoji">👤</span>
                                <p class="empty-title">Aucun utilisateur</p>
                                <p class="empty-subtitle">✨ Les premiers utilisateurs arrivent bientôt !</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        /* 🌟 EN-TÊTE */
        .users-header {
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

        .user-count {
            color: #555;
            font-size: 0.9rem;
            background: white;
            padding: 0.4rem 1.2rem;
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            font-weight: 500;
        }

        .user-stats {
            display: flex;
            gap: 0.5rem;
        }

        .stat-badge {
            padding: 0.3rem 0.8rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .stat-badge.admin {
            background: #fef3c7;
            color: #d97706;
        }

        .stat-badge.owner {
            background: #dbeafe;
            color: #3b82f6;
        }

        .stat-badge.user {
            background: #d1fae5;
            color: #00b894;
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

        ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page {
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page:hover {
            background: #e8f0fe;
        }

        .user-cell {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .user-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #e8f0fe, #dbeafe);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 600;
            color: #3b82f6;
            flex-shrink: 0;
        }

        .user-email {
            font-weight: 500;
            color: #1a237e;
        }

        .role-tag {
            padding: 0.3rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
        }

        .role-tag.admin {
            background: #fef3c7;
            color: #d97706;
        }

        .role-tag.owner {
            background: #dbeafe;
            color: #3b82f6;
        }

        .role-tag.user {
            background: #d1fae5;
            color: #00b894;
        }

        .action-buttons {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        ::ng-deep .role-select .p-select {
            border-radius: 50px !important;
            border: 2px solid #e0e0e0 !important;
            transition: all 0.3s ease !important;
        }

        ::ng-deep .role-select .p-select:hover {
            border-color: #3b82f6 !important;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
        }

        ::ng-deep .role-select .p-select .p-select-label {
            padding: 0.3rem 0.8rem !important;
            font-size: 0.85rem !important;
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
            color: #1a237e;
            margin: 0.5rem 0;
        }

        .empty-subtitle {
            color: #888;
            font-size: 1rem;
            margin: 0;
        }

        /* 📱 RESPONSIVE */
        @media (max-width: 1024px) {
            .action-buttons {
                flex-wrap: wrap;
            }

            ::ng-deep .role-select {
                width: 100% !important;
                min-width: 120px !important;
            }
        }

        @media (max-width: 768px) {
            .users-header {
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

            .user-stats {
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

            .user-cell {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.3rem;
            }

            .user-avatar {
                width: 2rem;
                height: 2rem;
                font-size: 1rem;
            }

            .action-buttons {
                flex-direction: column;
                align-items: stretch;
                gap: 0.3rem;
            }

            ::ng-deep .role-select {
                width: 100% !important;
            }
        }

        @media (max-width: 480px) {
            .user-stats {
                flex-direction: column;
                gap: 0.3rem;
            }
        }
    `]
})
export class AdminUsers {
    users = signal<any[]>([]);
    adminService = inject(AdminService);
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);

    roleOptions = [
        { label: '👤 Utilisateur', value: 'user' },
        { label: '👔 Propriétaire', value: 'owner' },
        { label: '👑 Admin', value: 'admin' }
    ];

    ngOnInit() {
        this.load();
    }

    load() {
        this.adminService.getUsers().subscribe({
            next: (data) => {
                this.users.set(data);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger les utilisateurs'
                });
            }
        });
    }

    getRoleCount(role: string): number {
        return this.users().filter(u => u.role === role).length;
    }

    getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            'admin': '👑 Admin',
            'owner': '👔 Propriétaire',
            'user': '👤 Utilisateur'
        };
        return labels[role] || role;
    }

    getAvatar(email: string): string {
        return email.charAt(0).toUpperCase();
    }

    changeRole(user: any) {
        if (!user.newRole) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Attention',
                detail: 'Veuillez sélectionner un rôle'
            });
            return;
        }

        const roleLabel = this.getRoleLabel(user.newRole);
        this.adminService.updateUserRole(user.id, user.newRole).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Rôle mis à jour',
                    detail: `${user.email} est maintenant ${roleLabel} ✨`
                });
                this.load();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de mettre à jour le rôle'
                });
            }
        });
    }

    confirmRemove(user: any) {
        this.confirmationService.confirm({
            message: `🗑️ Voulez-vous vraiment supprimer le compte de "${user.email}" ?`,
            header: '🗑️ Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '🗑️ Supprimer',
            rejectLabel: ' Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-rounded',
            rejectButtonStyleClass: 'p-button-text p-button-rounded',
            accept: () => this.removeUser(user.id, user.email)
        });
    }

    removeUser(userId: string, email: string) {
        this.adminService.deleteUser(userId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Supprimé',
                    detail: `${email} a été supprimé avec succès ✨`
                });
                this.load();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de supprimer l\'utilisateur'
                });
            }
        });
    }
}