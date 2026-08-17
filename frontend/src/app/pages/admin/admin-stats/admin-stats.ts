import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Stats } from '../../../services/admin';

@Component({
    selector: 'app-admin-stats',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (stats(); as s) {
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 md:col-span-4">
                    <div class="card">
                        <div class="text-surface-500 mb-2">Utilisateurs</div>
                        <div class="text-3xl font-bold">{{ s.total_users }}</div>
                        <div class="text-sm text-surface-500 mt-2">dont {{ s.total_owners }} propriétaires</div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <div class="card">
                        <div class="text-surface-500 mb-2">Logements</div>
                        <div class="text-3xl font-bold">{{ s.total_properties }}</div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <div class="card">
                        <div class="text-surface-500 mb-2">Réservations</div>
                        <div class="text-3xl font-bold">{{ s.total_bookings }}</div>
                        <div class="text-sm text-surface-500 mt-2">
                            {{ s.pending_bookings }} en attente, {{ s.confirmed_bookings }} confirmées
                        </div>
                    </div>
                </div>
            </div>
        }
    `
})
export class AdminStats {
    stats = signal<Stats | null>(null);
    adminService = inject(AdminService);

    ngOnInit() {
        this.adminService.getStats().subscribe((data) => this.stats.set(data));
    }
}