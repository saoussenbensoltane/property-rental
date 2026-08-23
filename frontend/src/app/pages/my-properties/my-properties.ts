// src/app/pages/my-properties/my-properties.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // ✅ AJOUT
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PropertyService, Property } from '../../services/property';
import { AuthService } from '../../services/auth';
import { Header } from '@/app/shared/header';

@Component({
    selector: 'app-my-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,  // ✅ AJOUT - Nécessaire pour ngModel
        RouterModule,
        CardModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        ToastModule,
        ConfirmDialogModule,
        Header
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <app-header></app-header>

        <div class="properties-header">
            <div class="header-content">
                <div class="header-left">
                    <span class="header-emoji">🏠</span>
                    <div>
                        <h1 class="header-title">Mes logements</h1>
                        <p class="header-subtitle">✨ Gérez vos propriétés en toute simplicité</p>
                    </div>
                </div>
                <div class="header-right">
                    <span class="property-count">📊 {{ properties().length }} logements</span>
                    <button class="btn-add" (click)="router.navigate(['/add-property'])">
                        ➕ Ajouter un logement
                    </button>
                </div>
            </div>
        </div>

        <div class="properties-grid">
            @if (properties().length === 0) {
                <div class="empty-state">
                    <span class="empty-emoji">🏠</span>
                    <h2 class="empty-title">Aucun logement</h2>
                    <p class="empty-text">💭 Vous n'avez pas encore publié de logement</p>
                    <button class="btn-add-empty" (click)="router.navigate(['/add-property'])">
                        ➕ Ajouter votre premier logement
                    </button>
                </div>
            }

            <div class="grid grid-cols-12 gap-4">
                @for (property of properties(); track property._id) {
                    <div class="col-span-12 md:col-span-6 lg:col-span-4">
                        <div class="property-card">
                            <p-card [header]="property.title" class="h-full">
                                @if (property.images && property.images.length > 0) {
                                    <img [src]="property.images[0]" class="w-full h-52 object-cover rounded-lg mb-4 property-image" />
                                } @else {
                                    <div class="w-full h-52 bg-surface-200 rounded-lg mb-4 flex items-center justify-center text-surface-500 property-placeholder">
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
                                            ✨ Voir
                                        </a>
                                        <button class="btn-edit" (click)="openEdit(property)">
                                            ✏️
                                        </button>
                                        <button class="btn-delete" (click)="confirmDelete(property)">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </p-card>
                        </div>
                    </div>
                }
            </div>
        </div>

        <!-- Dialog d'édition -->
        <p-dialog [header]="'✏️ Modifier mon logement'" [(visible)]="showEditDialog" [modal]="true" [style]="{ width: '32rem' }">
            <div class="edit-content">
                <div class="form-group">
                    <label class="block mb-2 font-medium">📝 Titre</label>
                    <input pInputText [(ngModel)]="editTitle" class="w-full mb-4" />
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">📖 Description</label>
                    <textarea pTextarea [(ngModel)]="editDescription" rows="3" class="w-full mb-4"></textarea>
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">💰 Prix par nuit (TND)</label>
                    <p-inputNumber [(ngModel)]="editPrice" mode="currency" currency="TND" styleClass="w-full mb-4"></p-inputNumber>
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">📍 Localisation</label>
                    <input pInputText [(ngModel)]="editLocation" class="w-full mb-4" />
                </div>

                <div class="form-group">
                    <label class="block mb-2 font-medium">🏠 Type</label>
                    <input pInputText [(ngModel)]="editType" class="w-full mb-4" />
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

                <div class="dialog-actions">
                    <button class="btn-cancel" (click)="showEditDialog = false">Annuler</button>
                    <button class="btn-save" (click)="saveEdit()">💾 Enregistrer</button>
                </div>
            </div>
        </p-dialog>
    `,
    styles: [`
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
            flex-wrap: wrap;
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

        .btn-add {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
        }

        .btn-add:hover {
            transform: scale(1.05);
        }

        .properties-grid {
            margin: 0 1.5rem 1.5rem;
        }

        .property-card {
            transition: transform 0.3s ease;
            height: 100%;
        }

        .property-card:hover {
            transform: translateY(-5px);
        }

        .property-card ::ng-deep .p-card {
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            height: 100%;
        }

        .property-actions {
            display: flex;
            gap: 0.5rem;
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

        .btn-edit {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 50px;
            background: #dbeafe;
            color: #3b82f6;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-edit:hover {
            background: #3b82f6;
            color: white;
        }

        .btn-delete {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 50px;
            background: #fee2e2;
            color: #ef4444;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-delete:hover {
            background: #ef4444;
            color: white;
        }

        .empty-state {
            background: white;
            border-radius: 20px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .empty-emoji {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
            animation: float 3s ease-in-out infinite;
        }

        .empty-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d1b69;
        }

        .empty-text {
            color: #888;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        .btn-add-empty {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.8rem 2.5rem;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-add-empty:hover {
            transform: scale(1.05);
        }

        .dialog-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
        }

        .btn-cancel {
            padding: 0.5rem 1.5rem;
            border: 2px solid #e0e0e0;
            border-radius: 50px;
            background: white;
            color: #666;
            font-weight: 500;
            cursor: pointer;
        }

        .btn-save {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-save:hover {
            transform: scale(1.05);
        }

        .preview-container {
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid #eee;
        }

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

            .properties-grid {
                margin: 0 1rem 1rem;
            }

            .property-actions {
                flex-wrap: wrap;
            }
        }
    `]
})
export class MyProperties {
    properties = signal<Property[]>([]);

    showEditDialog = false;
    editingId: string | null = null;
    editTitle = '';
    editDescription = '';
    editPrice: number | null = null;
    editLocation = '';
    editType = '';
    editSelectedFile: File | null = null;
    editPreviewUrl: string | null = null;

    propertyService = inject(PropertyService);
    authService = inject(AuthService);
    router = inject(Router);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    ngOnInit() {
        this.loadMyProperties();
    }

    loadMyProperties() {
        const ownerId = this.authService.getUserId();
        if (!ownerId) {
            this.messageService.add({
                severity: 'warn',
                summary: '🔐 Connexion requise',
                detail: 'Connectez-vous pour voir vos logements'
            });
            this.router.navigate(['/auth/login']);
            return;
        }

        // Récupérer toutes les propriétés et filtrer par owner_id
        this.propertyService.getAll().subscribe({
            next: (data) => {
                const myProperties = data.filter(p => p.owner_id === ownerId);
                this.properties.set(myProperties);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger vos logements'
                });
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
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de modifier le logement'
                });
            }
        });
    }

    finishEdit() {
        this.showEditDialog = false;
        this.editSelectedFile = null;
        this.editPreviewUrl = null;
        this.loadMyProperties();
        this.messageService.add({
            severity: 'success',
            summary: '✨ Logement modifié !',
            detail: 'Votre propriété a été mise à jour avec succès 🌟'
        });
    }

    confirmDelete(property: Property) {
        this.confirmationService.confirm({
            message: `🗑️ Voulez-vous vraiment supprimer "${property.title}" ?`,
            header: 'Confirmer la suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '🗑️ Supprimer',
            rejectLabel: '❤️ Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-rounded',
            rejectButtonStyleClass: 'p-button-text p-button-rounded',
            accept: () => {
                // ✅ CORRECTION: utiliser removeProperty() au lieu de delete()
                this.removeProperty(property._id);
            }
        });
    }

    // ✅ AJOUT DE LA MÉTHODE removeProperty()
    removeProperty(propertyId: string) {
        this.propertyService.deleteProperty(propertyId).subscribe({
            next: () => {
                this.loadMyProperties();
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Supprimé',
                    detail: 'Logement supprimé avec succès ✨'
                });
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
}