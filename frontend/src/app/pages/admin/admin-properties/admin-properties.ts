import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AdminService } from '../../../services/admin';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-admin-properties',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <div class="font-semibold text-xl mb-4">Tous les logements</div>
            <p-table [value]="properties()" [paginator]="true" [rows]="10" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Titre</th>
                        <th>Localisation</th>
                        <th>Type</th>
                        <th>Prix</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-property>
                    <tr>
                        <td>{{ property.title }}</td>
                        <td>{{ property.location }}</td>
                        <td>{{ property.type }}</td>
                        <td>{{ property.price | currency: 'USD' }}</td>
                        <td>
<p-button icon="pi pi-trash" severity="danger" size="small" [rounded]="true" [outlined]="true" (onClick)="confirmRemove(property)" pTooltip="Supprimer"></p-button>                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
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
        this.adminService.getAllProperties().subscribe((data) => this.properties.set(data));
    }

    confirmRemove(property: any) {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment supprimer le logement "${property.title}" ? Cette action est irréversible.`,
            header: 'Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => this.removeProperty(property._id, property.title)
        });
    }

    removeProperty(propertyId: string, title: string) {
        this.adminService.deleteProperty(propertyId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: `"${title}" a été supprimé` });
                this.load();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' })
        });
    }
}