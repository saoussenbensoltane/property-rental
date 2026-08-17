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

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, SelectModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <div class="font-semibold text-xl mb-4">Utilisateurs</div>
            <p-table [value]="users()" [paginator]="true" [rows]="10" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-user>
                    <tr>
                        <td>{{ user.email }}</td>
                        <td><p-tag [value]="user.role"></p-tag></td>
                        <td class="flex gap-2 items-center">
                            <p-select [(ngModel)]="user.newRole" [options]="roleOptions" placeholder="Changer rôle" styleClass="w-40"></p-select>
                            <p-button icon="pi pi-check" severity="success" size="small" [rounded]="true" [outlined]="true" (onClick)="changeRole(user)" pTooltip="Appliquer le rôle"></p-button>
<p-button icon="pi pi-trash" severity="danger" size="small" [rounded]="true" [outlined]="true" (onClick)="confirmRemove(user)" pTooltip="Supprimer"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class AdminUsers {
    users = signal<any[]>([]);
    adminService = inject(AdminService);
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);

    roleOptions = ['user', 'owner', 'admin'];

    ngOnInit() {
        this.load();
    }

    load() {
        this.adminService.getUsers().subscribe((data) => this.users.set(data));
    }

    changeRole(user: any) {
        if (!user.newRole) return;
        this.adminService.updateUserRole(user.id, user.newRole).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Rôle mis à jour', detail: `${user.email} est maintenant ${user.newRole}` });
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour du rôle' })
        });
    }

    confirmRemove(user: any) {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment supprimer le compte de ${user.email} ? Cette action est irréversible.`,
            header: 'Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => this.removeUser(user.id, user.email)
        });
    }

    removeUser(userId: string, email: string) {
        this.adminService.deleteUser(userId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: `${email} a été supprimé` });
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' })
        });
    }
}