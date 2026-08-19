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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
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
        ToastModule,
        Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" [baseZIndex]="9999"></p-toast>
        <app-header></app-header>

        <!-- 🌟 SECTION RECHERCHE CUTE -->
        <div class="search-section">
            <h2 class="search-title">✨ Trouvez votre prochain séjour de rêve</h2>
            <p class="search-subtitle">🌍 Découvrez des logements uniques pour des vacances inoubliables</p>
            
            <div class="flex flex-wrap gap-3 items-end mt-4">
                <div>
                    <label class="block mb-1 text-sm font-medium">📍 Localisation</label>
                    <input pInputText [(ngModel)]="filterLocation" placeholder="ex: Tunis" class="w-48" />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium">🏠 Type</label>
                    <input pInputText [(ngModel)]="filterType" placeholder="ex: appartement" class="w-48" />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium">💰 Prix min</label>
                    <p-inputNumber [(ngModel)]="filterPriceMin" mode="currency" currency="TND"></p-inputNumber>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium">💰 Prix max</label>
                    <p-inputNumber [(ngModel)]="filterPriceMax" mode="currency" currency="TND"></p-inputNumber>
                </div>
                <p-button label="🔍 Rechercher" styleClass="p-button-rounded" (onClick)="applyFilters()"></p-button>
                <p-button label="🔄 Réinitialiser" severity="secondary" styleClass="p-button-rounded" (onClick)="resetFilters()"></p-button>
            </div>
        </div>

        <!-- 📋 LISTE DES PROPRIÉTÉS -->
        <div class="grid grid-cols-12 gap-4 px-6 pb-6">
            @if (properties().length === 0) {
                <div class="col-span-12 text-center py-12">
                    <div class="empty-state">
                        <span class="empty-icon">🏠</span>
                        <h3 class="empty-title">Aucune propriété disponible pour le moment</h3>
                        <p class="empty-subtitle">✨ Revenez bientôt, de nouveaux logements arrivent !</p>
                    </div>
                </div>
            }

            @for (property of properties(); track property._id) {
                <div class="col-span-12 md:col-span-6 lg:col-span-4">
                    <div class="property-card">
                        <p-card [header]="property.title" class="h-full">
                            @if (property.images && property.images.length > 0) {
                                <img [src]="property.images[0]" class="w-full h-52 object-cover rounded-lg mb-4 property-image" />
                            } @else {
                                <div class="w-full h-52 bg-surface-200 dark:bg-surface-700 rounded-lg mb-4 flex items-center justify-center text-surface-500 property-placeholder">
                                    <span>🏠</span>
                                    <span class="ml-2">Pas de photo</span>
                                </div>
                            }

                            <div class="property-info">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="property-location">📍 {{ property.location }}</span>
                                    <span class="property-type">🏷️ {{ property.type }}</span>
                                </div>

                                <p class="property-description mb-3">{{ property.description }}</p>
                                
                                <div class="property-price">
                                    <span class="price-amount">{{ property.price | number }} <span class="price-currency">TND</span></span>
                                    <span class="price-period"> / nuit</span>
                                </div>

                                <div class="property-actions mt-4 flex gap-2">
                                    <a [routerLink]="['/properties', property._id]" class="btn-details">
                                        ✨ Voir les détails
                                    </a>

                                    @if (isMyProperty(property)) {
                                        <p-button label="✏️ Modifier" styleClass="p-button-rounded p-button-outlined" (onClick)="openEdit(property)"></p-button>
                                    } @else {
                                        <p-button label="💫 Réserver" styleClass="p-button-rounded" (onClick)="onReserve(property)"></p-button>
                                    }
                                </div>
                            </div>
                        </p-card>
                    </div>
                </div>
            }
        </div>

        <!-- 📅 DIALOG DE RÉSERVATION -->
        <p-dialog [header]="'✨ Réserver votre séjour de rêve'" [(visible)]="showDialog" [modal]="true" [style]="{ width: '28rem' }">
            @if (selectedProperty) {
                <div class="booking-content">
                    <div class="booking-property">
                        <span class="booking-property-icon">🏠</span>
                        <span class="booking-property-title">{{ selectedProperty.title }}</span>
                    </div>
                    <p class="booking-location">📍 {{ selectedProperty.location }}</p>

                    <div class="booking-dates">
                        <!-- 📅 DATE DE DÉPART (DÉBUT DU SÉJOUR) -->
                        <div class="date-group">
                            <label class="block mb-2 font-medium">📅 Date de départ</label>
                            <p-datepicker 
                                [(ngModel)]="departDate" 
                                [minDate]="today"
                                dateFormat="yy-mm-dd" 
                                styleClass="w-full mb-4"
                                placeholder="Choisissez votre date de départ"
                            ></p-datepicker>
                            <small class="form-hint">📆 Le jour où vous partez en vacances</small>
                        </div>

                        <!-- 📅 DATE D'ARRIVÉE (FIN DU SÉJOUR) -->
                        <div class="date-group">
                            <label class="block mb-2 font-medium">📅 Date d'arrivée</label>
                            <p-datepicker 
                                [(ngModel)]="arriveeDate" 
                                [minDate]="departDate"
                                dateFormat="yy-mm-dd" 
                                styleClass="w-full mb-4"
                                placeholder="Choisissez votre date d'arrivée"
                            ></p-datepicker>
                            <small class="form-hint">📆 Le jour où vous arrivez (après le départ)</small>
                        </div>
                    </div>

                    @if (bookingError) {
                        <div class="error-message">
                            <span>😊 {{ bookingError }}</span>
                        </div>
                    }

                    @if (departDate && arriveeDate) {
                        <div class="booking-summary">
                            <p class="booking-duration">⏱️ Durée : {{ calculateNights(departDate, arriveeDate) }} nuits de rêve ✨</p>
                            @if (calculateNights(departDate, arriveeDate) < 1) {
                                <p class="booking-warning">⚠️ La date d'arrivée doit être après la date de départ</p>
                            }
                        </div>
                    }

                    <p-button 
                        label="💫 Confirmer ma réservation" 
                        styleClass="w-full p-button-rounded" 
                        (onClick)="confirmBooking()"
                        [disabled]="!departDate || !arriveeDate || calculateNights(departDate, arriveeDate) < 1"
                    ></p-button>
                </div>
            }
        </p-dialog>

        <!-- ✏️ DIALOG D'ÉDITION -->
        <p-dialog [header]="'✏️ Modifier mon logement'" [(visible)]="showEditDialog" [modal]="true" [style]="{ width: '32rem' }">
            <div class="edit-content">
                <div class="form-group">
                    <label class="block mb-2 font-medium">📝 Titre</label>
                    <input pInputText [(ngModel)]="editTitle" class="w-full mb-4" placeholder="Donnez un titre attractif..." />
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">📖 Description</label>
                    <textarea pTextarea [(ngModel)]="editDescription" rows="3" class="w-full mb-4" placeholder="Décrivez votre logement..."></textarea>
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">💰 Prix par nuit (TND)</label>
                    <p-inputNumber [(ngModel)]="editPrice" mode="currency" currency="TND" styleClass="w-full mb-4"></p-inputNumber>
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">📍 Localisation</label>
                    <input pInputText [(ngModel)]="editLocation" class="w-full mb-4" placeholder="ex: Tunis, Sousse..." />
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">🏠 Type</label>
                    <input pInputText [(ngModel)]="editType" class="w-full mb-4" placeholder="ex: appartement, villa..." />
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">📸 Changer la photo</label>
                    <input type="file" (change)="onEditFileSelected($event)" accept="image/*" class="w-full mb-4" />
                </div>

                @if (editPreviewUrl) {
                    <div class="preview-container">
                        <img [src]="editPreviewUrl" class="w-full h-44 object-cover rounded-lg mb-4" />
                    </div>
                }

                @if (editError) {
                    <div class="error-message">
                        <span>😊 {{ editError }}</span>
                    </div>
                }

                <p-button label="💾 Enregistrer" styleClass="w-full p-button-rounded" (onClick)="saveEdit()"></p-button>
            </div>
        </p-dialog>
    `,
    styles: [`
        .search-section {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%);
            border-radius: 16px;
            margin: 1.5rem;
            padding: 2rem;
        }

        .search-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d1b69;
            margin-bottom: 0.5rem;
        }

        .search-subtitle {
            color: #666;
            font-size: 1.1rem;
        }

        .property-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            height: 100%;
        }

        .property-card:hover {
            transform: translateY(-5px);
        }

        .property-card ::ng-deep .p-card {
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            transition: box-shadow 0.3s ease;
            height: 100%;
        }

        .property-card:hover ::ng-deep .p-card {
            box-shadow: 0 8px 32px rgba(255, 107, 157, 0.15);
        }

        .property-image {
            transition: transform 0.3s ease;
        }

        .property-card:hover .property-image {
            transform: scale(1.03);
        }

        .property-placeholder {
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            font-size: 1.2rem;
        }

        .property-location {
            font-size: 0.9rem;
            color: #666;
            background: #f0f0f0;
            padding: 0.2rem 0.8rem;
            border-radius: 20px;
        }

        .property-type {
            font-size: 0.9rem;
            color: #666;
            background: #f0f0f0;
            padding: 0.2rem 0.8rem;
            border-radius: 20px;
        }

        .property-description {
            color: #444;
            font-size: 0.95rem;
            line-height: 1.5;
            min-height: 3rem;
        }

        .property-price {
            padding: 0.5rem 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }

        .price-amount {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .price-currency {
            font-size: 0.9rem;
            font-weight: 600;
            color: #ff6b6b;
        }

        .price-period {
            font-size: 0.9rem;
            color: #666;
        }

        .btn-details {
            display: inline-block;
            padding: 0.5rem 1.2rem;
            border: 2px solid #ff6b6b;
            border-radius: 50px;
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            flex: 1;
            text-align: center;
        }

        .btn-details:hover {
            background: #ff6b6b;
            color: white;
        }

        .empty-state {
            padding: 3rem;
        }

        .empty-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
        }

        .empty-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d1b69;
            margin-bottom: 0.5rem;
        }

        .empty-subtitle {
            color: #888;
            font-size: 1.1rem;
        }

        .booking-property {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 0.5rem;
        }

        .booking-property-icon {
            font-size: 1.5rem;
        }

        .booking-property-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d1b69;
        }

        .booking-location {
            color: #666;
            margin-bottom: 1.5rem;
        }

        .booking-dates {
            margin: 1.5rem 0;
        }

        .booking-summary {
            background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
            padding: 0.8rem;
            border-radius: 12px;
            margin: 1rem 0;
            text-align: center;
        }

        .booking-duration {
            font-weight: 500;
            color: #2d1b69;
        }

        .booking-warning {
            color: #f39c12;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #fef3c7;
            border-radius: 8px;
        }

        .error-message {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem;
            color: #d63031;
            margin-bottom: 1rem;
            text-align: center;
        }

        .form-hint {
            display: block;
            font-size: 0.75rem;
            color: #888;
            margin-top: -0.3rem;
            margin-bottom: 0.5rem;
        }

        .form-group {
            margin-bottom: 0.5rem;
        }

        .preview-container {
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #eee;
        }

        ::ng-deep .p-button {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        ::ng-deep .p-button:hover {
            transform: scale(1.02);
        }

        ::ng-deep .p-button-rounded {
            border-radius: 50px !important;
        }

        ::ng-deep .p-inputtext, ::ng-deep .p-inputnumber {
            border-radius: 12px !important;
        }

        ::ng-deep .p-datepicker {
            border-radius: 12px !important;
        }

        ::ng-deep .p-card .p-card-body {
            padding: 1.5rem;
        }

        ::ng-deep .p-datepicker table td {
            padding: 0.2rem !important;
        }

        ::ng-deep .p-datepicker .p-datepicker-header {
            padding: 0.5rem !important;
        }

        @media (max-width: 768px) {
            .search-section {
                margin: 1rem;
                padding: 1rem;
            }

            .search-title {
                font-size: 1.4rem;
            }

            .search-subtitle {
                font-size: 0.95rem;
            }

            .price-amount {
                font-size: 1.2rem;
            }

            .booking-dates {
                margin: 1rem 0;
            }
        }
    `]
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
    departDate: Date | null = null;
    arriveeDate: Date | null = null;
    bookingError = '';
    today: Date = new Date();

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
    private messageService = inject(MessageService);

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
        
        const today = new Date();
        this.departDate = new Date(today);
        this.departDate.setDate(today.getDate() + 1);
        this.arriveeDate = new Date(today);
        this.arriveeDate.setDate(today.getDate() + 3);
        
        this.bookingError = '';
        this.showDialog = true;
    }

    calculateNights(depart: Date | null, arrivee: Date | null): number {
        if (!depart || !arrivee) return 0;
        
        const departDate = new Date(depart);
        departDate.setHours(0, 0, 0, 0);
        const arriveeDate = new Date(arrivee);
        arriveeDate.setHours(0, 0, 0, 0);
        
        if (arriveeDate <= departDate) return 0;
        
        const diff = arriveeDate.getTime() - departDate.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    confirmBooking() {
        // 1. Vérifier que les dates sont sélectionnées
        if (!this.departDate || !this.arriveeDate || !this.selectedProperty) {
            this.bookingError = '💝 Merci de choisir vos dates de séjour';
            return;
        }
        
        // 2. Vérifier que la date d'arrivée est après la date de départ
        const depart = new Date(this.departDate);
        depart.setHours(0, 0, 0, 0);
        const arrivee = new Date(this.arriveeDate);
        arrivee.setHours(0, 0, 0, 0);
        
        if (arrivee <= depart) {
            this.bookingError = '📆 La date d\'arrivée doit être après la date de départ ✨';
            return;
        }

        // 3. Vérifier que la date de départ n'est pas dans le passé
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (depart < today) {
            this.bookingError = '📆 La date de départ ne peut pas être dans le passé ✨';
            return;
        }

        // 4. Formater les dates pour le backend
        const startDate = new Date(this.departDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(this.arriveeDate);
        endDate.setHours(0, 0, 0, 0);

        // 5. Envoyer la réservation
        this.bookingService.create({
            property_id: this.selectedProperty._id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        }).subscribe({
            next: () => {
                this.showDialog = false;
                
                const nights = this.calculateNights(this.departDate!, this.arriveeDate!);
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Réservation confirmée !',
                    detail: `✨ ${this.selectedProperty?.title} vous attend ! Préparez vos valises pour ${nights} nuits de rêve ✈️`,
                    life: 5000
                });
                
                this.departDate = null;
                this.arriveeDate = null;
                this.selectedProperty = null;
            },
            error: (err) => {
                console.error('Erreur réservation:', err);
                
                // ✅ GESTION COMPLÈTE DES ERREURS
                if (err.status === 422) {
                    // Erreur de validation Pydantic
                    const detail = err.error?.detail;
                    if (Array.isArray(detail) && detail.length > 0) {
                        // Extraire tous les messages d'erreur
                        const messages = detail.map((e: any) => {
                            if (e.msg) return e.msg;
                            if (e.message) return e.message;
                            return 'Champ invalide';
                        });
                        this.bookingError = '😊 ' + messages.join('. ');
                    } else if (typeof detail === 'string') {
                        this.bookingError = '😊 ' + detail;
                    } else {
                        this.bookingError = '😊 Veuillez vérifier vos dates';
                    }
                } else if (err.status === 400) {
                    // Erreur de validation métier
                    this.bookingError = '😊 ' + (err.error?.detail || 'Dates invalides');
                } else if (err.status === 409) {
                    // Conflit de réservation
                    this.bookingError = '😔 Ce logement est déjà réservé sur ces dates. Essayez une autre période !';
                } else if (err.status === 401) {
                    this.bookingError = '🔐 Veuillez vous reconnecter pour réserver';
                    this.authService.logout();
                    setTimeout(() => this.router.navigate(['/auth/login']), 1500);
                } else {
                    this.bookingError = '😊 Oups ! Un petit souci technique. Réessayez ?';
                }
            }
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
            error: (err) => {
                if (err.status === 422) {
                    const detail = err.error?.detail;
                    if (Array.isArray(detail) && detail.length > 0) {
                        this.editError = '😊 ' + detail.map((e: any) => e.msg).join('. ');
                    } else {
                        this.editError = '😊 Veuillez vérifier vos informations';
                    }
                } else {
                    this.editError = '😊 Oups ! Impossible de modifier. Réessayez ?';
                }
            }
        });
    }

    finishEdit() {
        this.showEditDialog = false;
        this.editSelectedFile = null;
        this.editPreviewUrl = null;
        this.load();
        this.messageService.add({
            severity: 'success',
            summary: '✨ Logement modifié !',
            detail: 'Votre propriété a été mise à jour avec succès 🌟'
        });
    }
}