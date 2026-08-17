import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
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
    imports: [CommonModule, TableModule, TagModule, ButtonModule, Header],
    template: `
        <app-header></app-header>
        <div class="card mx-6">
            <div class="font-semibold text-xl mb-4">Réservations reçues</div>
            <p-table [value]="bookings()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Logement</th>
                        <th>Arrivée</th>
                        <th>Départ</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-booking>
                    <tr>
                        <td>{{ booking.property?.title || 'Logement supprimé' }}</td>
                        <td>{{ booking.start_date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ booking.end_date | date: 'dd/MM/yyyy' }}</td>
                        <td>
                            <p-tag [value]="booking.status" [severity]="statusColor(booking.status)"></p-tag>
                        </td>
                        <td>
                            @if (booking.status === 'pending') {
                                <p-button icon="pi pi-check" severity="success" size="small" [rounded]="true" [outlined]="true" styleClass="mr-2" (onClick)="updateStatus(booking._id, 'confirmed')" pTooltip="Confirmer"></p-button>
<p-button icon="pi pi-times" severity="danger" size="small" [rounded]="true" [outlined]="true" (onClick)="updateStatus(booking._id, 'cancelled')" pTooltip="Annuler"></p-button>
                            }
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="5" class="text-center">Aucune réservation reçue pour le moment</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class OwnerBookings {
    bookings = signal<BookingWithProperty[]>([]);
    bookingService = inject(BookingService);
    propertyService = inject(PropertyService);

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
        ).subscribe(result => {
            this.bookings.set(result as BookingWithProperty[]);
        });
    }

    updateStatus(bookingId: string, status: string) {
        this.bookingService.updateStatus(bookingId, status).subscribe({
            next: () => this.loadBookings(),
            error: () => alert('Erreur lors de la mise à jour')
        });
    }

    statusColor(status: string): 'success' | 'warn' | 'danger' | 'info' {
        if (status === 'confirmed') return 'success';
        if (status === 'cancelled') return 'danger';
        return 'warn';
    }
}