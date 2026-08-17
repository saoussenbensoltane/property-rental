import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Stats } from '@/app/services/admin';

import { AdminProperties } from '../../admin/admin-properties/admin-properties';
import { AdminUsers } from '../../admin/admin-users/admin-users';


@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, AdminUsers, AdminProperties],
    template: `
        <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">Utilisateurs</span>
                    <div class="text-2xl font-bold mt-2">{{ stats()?.total_users ?? '–' }}</div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">Owners</span>
                    <div class="text-2xl font-bold mt-2">{{ stats()?.total_owners ?? '–' }}</div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">Logements</span>
                    <div class="text-2xl font-bold mt-2">{{ stats()?.total_properties ?? '–' }}</div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">Réservations</span>
                    <div class="text-2xl font-bold mt-2">{{ stats()?.total_bookings ?? '–' }}</div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">En attente</span>
                    <div class="text-2xl font-bold mt-2 text-orange-500">{{ stats()?.pending_bookings ?? '–' }}</div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-2">
                <div class="card !mb-0">
                    <span class="text-muted-color font-medium">Confirmées</span>
                    <div class="text-2xl font-bold mt-2 text-green-500">{{ stats()?.confirmed_bookings ?? '–' }}</div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-6">
            <app-admin-users />
            <app-admin-properties />
        </div>
    `
})
export class Dashboard implements OnInit {
    adminService = inject(AdminService);
    stats = signal<Stats | null>(null);

    ngOnInit() {
        this.adminService.getStats().subscribe(data => this.stats.set(data));
    }
}