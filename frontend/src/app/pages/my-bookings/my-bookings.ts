import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BookingService, Booking } from '../../services/booking';
import { Header } from '../../shared/header';


@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, Header],
    template: `
        <app-header></app-header>
        <div class="card mx-6">
            <div class="font-semibold text-xl mb-4">Mes réservations</div>
            <p-table [value]="bookings()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Logement</th>
                        <th>Arrivée</th>
                        <th>Départ</th>
                        <th>Statut</th>
                    </tr>
                </ng-template>
                <ng-template #body let-booking>
                    <tr>
                        <td>{{ booking.property_id }}</td>
                        <td>{{ booking.start_date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ booking.end_date | date: 'dd/MM/yyyy' }}</td>
                        <td>
                            <p-tag [value]="booking.status" [severity]="statusColor(booking.status)"></p-tag>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="4" class="text-center">Aucune réservation pour le moment</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class MyBookings {
    bookings = signal<Booking[]>([]);
    bookingService = inject(BookingService);

    ngOnInit() {
        this.bookingService.getMyBookings().subscribe((data) => this.bookings.set(data));
    }

    statusColor(status: string): 'success' | 'warn' | 'danger' | 'info' {
        if (status === 'confirmed') return 'success';
        if (status === 'cancelled') return 'danger';
        return 'warn';
    }
}