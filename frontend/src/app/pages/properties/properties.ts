import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { PropertyService, Property } from '../../services/property';
import { AuthService } from '../../services/auth';
import { BookingService } from '../../services/booking';
import { Header } from '@/app/shared/header';


@Component({
    selector: 'app-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        DialogModule,
        DatePickerModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        Header
    ],
    template: `
        <app-header></app-header>

        <div class="flex flex-wrap gap-3 items-end px-6 mb-6">
            <div>
                <label class="block mb-1 text-sm">Localisation</label>
                <input pInputText [(ngModel)]="filterLocation" placeholder="ex: Tunis" />
            </div>
            <div>
                <label class="block mb-1 text-sm">Type</label>
                <input pInputText [(ngModel)]="filterType" placeholder="ex: appartement" />
            </div>
            <div>
                <label class="block mb-1 text-sm">Prix min</label>
                <p-inputNumber [(ngModel)]="filterPriceMin" mode="currency" currency="TND"></p-inputNumber>
            </div>
            <div>
                <label class="block mb-1 text-sm">Prix max</label>
                <p-inputNumber [(ngModel)]="filterPriceMax" mode="currency" currency="TND"></p-inputNumber>
            </div>
            <p-button label="Rechercher" (onClick)="applyFilters()"></p-button>
            <p-button label="Réinitialiser" severity="secondary" (onClick)="resetFilters()"></p-button>
        </div>

        <div class="grid grid-cols-12 gap-4 px-6">
            @for (property of properties(); track property._id) {
                <div class="col-span-12 md:col-span-6 lg:col-span-4">
                    <p-card [header]="property.title">
                        @if (property.images && property.images.length > 0) {
                            <img [src]="property.images[0]" class="w-full h-48 object-cover rounded mb-4" />
                        } @else {
                            <div class="w-full h-48 bg-surface-200 dark:bg-surface-700 rounded mb-4 flex items-center justify-center text-surface-500">
                                Pas de photo
                            </div>
                        }

                        <a [routerLink]="['/properties', property._id]" class="text-primary underline cursor-pointer mb-2 block">
                            Voir les détails
                        </a>

                        <p class="mb-2">{{ property.location }} — {{ property.type }}</p>
                        <p class="mb-4">{{ property.description }}</p>
                        <p class="font-bold mb-4">{{ property.price | currency: 'TND' }} / nuit</p>

                        @if (isMyProperty(property)) {
                            <p-button label="Modifier" (onClick)="openEdit(property)"></p-button>
                        } @else {
                            <p-button label="Réserver" (onClick)="onReserve(property)"></p-button>
                        }
                    </p-card>
                </div>
            }
        </div>

        <p-dialog header="Réserver ce logement" [(visible)]="showDialog" [modal]="true" [style]="{ width: '25rem' }">
            @if (selectedProperty) {
                <p class="mb-4 font-semibold">{{ selectedProperty.title }}</p>
            }
            <label class="block mb-2">Date d'arrivée</label>
            <p-datepicker [(ngModel)]="startDate" dateFormat="yy-mm-dd" styleClass="w-full mb-4"></p-datepicker>

            <label class="block mb-2">Date de départ</label>
            <p-datepicker [(ngModel)]="endDate" dateFormat="yy-mm-dd" styleClass="w-full mb-4"></p-datepicker>

            @if (bookingError) {
                <p class="text-red-500 mb-4">{{ bookingError }}</p>
            }

            <p-button label="Confirmer la réservation" styleClass="w-full" (onClick)="confirmBooking()"></p-button>
        </p-dialog>

        <p-dialog header="Modifier le logement" [(visible)]="showEditDialog" [modal]="true" [style]="{ width: '30rem' }">
            <label class="block mb-2">Titre</label>
            <input pInputText [(ngModel)]="editTitle" class="w-full mb-4" />

            <label class="block mb-2">Description</label>
            <textarea pTextarea [(ngModel)]="editDescription" rows="3" class="w-full mb-4"></textarea>

            <label class="block mb-2">Prix par nuit (TND)</label>
            <p-inputNumber [(ngModel)]="editPrice" mode="currency" currency="TND" styleClass="w-full mb-4"></p-inputNumber>

            <label class="block mb-2">Localisation</label>
            <input pInputText [(ngModel)]="editLocation" class="w-full mb-4" />

            <label class="block mb-2">Type</label>
            <input pInputText [(ngModel)]="editType" class="w-full mb-4" />

            <label class="block mb-2">Changer la photo</label>
            <input type="file" (change)="onEditFileSelected($event)" accept="image/*" class="w-full mb-4" />

            @if (editPreviewUrl) {
                <img [src]="editPreviewUrl" class="w-full h-40 object-cover rounded mb-4" />
            }

            @if (editError) {
                <p class="text-red-500 mb-4">{{ editError }}</p>
            }

            <p-button label="Enregistrer" styleClass="w-full" (onClick)="saveEdit()"></p-button>
        </p-dialog>
    `
})
export class Properties {
    properties = signal<Property[]>([]);

    // Filtres
    filterLocation = '';
    filterType = '';
    filterPriceMin: number | null = null;
    filterPriceMax: number | null = null;

    // Réservation
    showDialog = false;
    selectedProperty: Property | null = null;
    startDate: Date | null = null;
    endDate: Date | null = null;
    bookingError = '';

    // Édition
    showEditDialog = false;
    editingId: string | null = null;
    editTitle = '';
    editDescription = '';
    editPrice: number | null = null;
    editLocation = '';
    editType = '';
    editError = '';
    editSelectedFile: File | null = null;
    editPreviewUrl: string | null = null;

    propertyService = inject(PropertyService);
    authService = inject(AuthService);
    bookingService = inject(BookingService);
    router = inject(Router);

    ngOnInit() {
        this.load();
    }

    load() {
        this.propertyService.getAll().subscribe((data) => this.properties.set(data));
    }

    applyFilters() {
        this.propertyService.search(
            this.filterLocation || undefined,
            this.filterType || undefined,
            this.filterPriceMin ?? undefined,
            this.filterPriceMax ?? undefined
        ).subscribe((data) => this.properties.set(data));
    }

    resetFilters() {
        this.filterLocation = '';
        this.filterType = '';
        this.filterPriceMin = null;
        this.filterPriceMax = null;
        this.load();
    }

    isMyProperty(property: Property): boolean {
        const myId = this.authService.getUserId();
        return !!myId && property.owner_id === myId;
    }

    onReserve(property: Property) {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth/login']);
            return;
        }
        this.selectedProperty = property;
        this.startDate = null;
        this.endDate = null;
        this.bookingError = '';
        this.showDialog = true;
    }

    confirmBooking() {
        if (!this.startDate || !this.endDate || !this.selectedProperty) {
            this.bookingError = 'Merci de choisir les deux dates';
            return;
        }
        if (this.endDate <= this.startDate) {
            this.bookingError = 'La date de départ doit être après la date d\'arrivée';
            return;
        }

        this.bookingService.create({
            property_id: this.selectedProperty._id,
            start_date: this.startDate.toISOString(),
            end_date: this.endDate.toISOString()
        }).subscribe({
            next: () => {
                this.showDialog = false;
                alert('Réservation créée avec succès !');
            },
            error: () => this.bookingError = 'Erreur lors de la réservation, réessaie.'
        });
    }

    openEdit(property: Property) {
        this.editingId = property._id;
        this.editTitle = property.title;
        this.editDescription = property.description;
        this.editPrice = property.price;
        this.editLocation = property.location;
        this.editType = property.type;
        this.editError = '';
        this.editSelectedFile = null;
        this.editPreviewUrl = null;
        this.showEditDialog = true;
    }

    onEditFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.editSelectedFile = file;
            this.editPreviewUrl = URL.createObjectURL(file);
        }
    }

    saveEdit() {
        if (!this.editingId) return;

        this.propertyService.update(this.editingId, {
            title: this.editTitle,
            description: this.editDescription,
            price: this.editPrice,
            location: this.editLocation,
            type: this.editType
        }).subscribe({
            next: () => {
                if (this.editSelectedFile && this.editingId) {
                    this.propertyService.uploadImage(this.editingId, this.editSelectedFile).subscribe({
                        next: () => this.finishEdit(),
                        error: () => this.finishEdit()
                    });
                } else {
                    this.finishEdit();
                }
            },
            error: () => this.editError = 'Erreur lors de la modification'
        });
    }

    finishEdit() {
        this.showEditDialog = false;
        this.editSelectedFile = null;
        this.editPreviewUrl = null;
        this.load();
    }
}