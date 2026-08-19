import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { PropertyService } from '../../services/property';
import { AuthService } from '../../services/auth';
import { Header } from '@/app/shared/header';

interface ImagePreview {
    file: File;
    previewUrl: string;
}

@Component({
    selector: 'app-add-property',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        InputTextModule, 
        InputNumberModule, 
        TextareaModule, 
        ButtonModule,
        SelectModule,
        ToastModule,
        Header
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-center"></p-toast>
        <app-header></app-header>

        <div class="add-property-container">
            <!-- 🌟 EN-TÊTE -->
            <div class="page-header">
                <div class="header-content">
                    <div class="header-left">
                        <span class="header-emoji">🏠</span>
                        <div>
                            <h1 class="header-title">Ajouter un logement</h1>
                            <p class="header-subtitle">✨ Partagez votre espace et accueillez des voyageurs</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <span class="step-badge">📝 Nouvelle annonce</span>
                    </div>
                </div>
            </div>

            <!-- 📝 FORMULAIRE -->
            <div class="form-container">
                <div class="form-card">
                    <form (ngSubmit)="onSubmit()" #propertyForm="ngForm">
                        <!-- Titre -->
                        <div class="form-group">
                            <label class="form-label">
                                📝 Titre <span class="required">*</span>
                            </label>
                            <input 
                                pInputText 
                                [(ngModel)]="title" 
                                name="title"
                                #titleInput="ngModel"
                                required
                                placeholder="Donnez un titre attractif à votre logement..."
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': titleInput.invalid && titleInput.dirty}"
                            />
                            <small class="form-hint">✨ Un bon titre attire plus de voyageurs</small>
                            <small class="form-error" *ngIf="titleInput.invalid && titleInput.dirty">
                                ⚠️ Le titre est obligatoire
                            </small>
                        </div>

                        <!-- Description -->
                        <div class="form-group">
                            <label class="form-label">
                                📖 Description <span class="required">*</span>
                            </label>
                            <textarea 
                                pTextarea 
                                [(ngModel)]="description" 
                                name="description"
                                #descInput="ngModel"
                                required
                                rows="4"
                                placeholder="Décrivez votre logement en quelques mots... Qu'est-ce qui le rend unique ?"
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': descInput.invalid && descInput.dirty}"
                            ></textarea>
                            <small class="form-hint">💭 Soyez précis et mettez en valeur les atouts de votre logement</small>
                            <small class="form-error" *ngIf="descInput.invalid && descInput.dirty">
                                ⚠️ La description est obligatoire
                            </small>
                        </div>

                        <!-- Prix -->
                        <div class="form-group">
                            <label class="form-label">
                                💰 Prix par nuit <span class="required">*</span>
                            </label>
                            <p-inputNumber 
                                [(ngModel)]="price" 
                                name="price"
                                #priceInput="ngModel"
                                required
                                mode="currency" 
                                currency="TND" 
                                [min]="0"
                                placeholder="ex: 120"
                                styleClass="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': priceInput.invalid && priceInput.dirty}"
                            ></p-inputNumber>
                            <small class="form-hint">💎 Un prix compétitif attire plus de réservations</small>
                            <small class="form-error" *ngIf="priceInput.invalid && priceInput.dirty">
                                ⚠️ Le prix est obligatoire
                            </small>
                        </div>

                        <!-- Localisation -->
                        <div class="form-group">
                            <label class="form-label">
                                📍 Localisation <span class="required">*</span>
                            </label>
                            <input 
                                pInputText 
                                [(ngModel)]="location" 
                                name="location"
                                #locInput="ngModel"
                                required
                                placeholder="ex: Tunis, Sousse, Yasmine Hammamet..."
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': locInput.invalid && locInput.dirty}"
                            />
                            <small class="form-hint">🌍 Précisez la ville ou la région</small>
                            <small class="form-error" *ngIf="locInput.invalid && locInput.dirty">
                                ⚠️ La localisation est obligatoire
                            </small>
                        </div>

                        <!-- Type -->
                        <div class="form-group">
                            <label class="form-label">
                                🏷️ Type de logement <span class="required">*</span>
                            </label>
                            <p-select 
                                [(ngModel)]="type" 
                                name="type"
                                #typeInput="ngModel"
                                required
                                [options]="typeOptions" 
                                placeholder="Choisissez un type..."
                                styleClass="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': typeInput.invalid && typeInput.dirty}"
                            ></p-select>
                            <small class="form-hint">🏠 Sélectionnez la catégorie de votre logement</small>
                            <small class="form-error" *ngIf="typeInput.invalid && typeInput.dirty">
                                ⚠️ Le type est obligatoire
                            </small>
                        </div>

                        <!-- Photos -->
                        <div class="form-group">
                            <label class="form-label">📸 Photos</label>
                            <div class="upload-area" 
                                 [class.dragover]="dragOver"
                                 (dragover)="onDragOver($event)"
                                 (dragleave)="onDragLeave($event)"
                                 (drop)="onDrop($event)">
                                <div class="upload-content">
                                    <span class="upload-icon">🖼️</span>
                                    <span class="upload-text">Glissez vos photos ici ou</span>
                                    <span class="upload-browse">📁 Parcourir</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        multiple
                                        (change)="onFilesSelected($event)"
                                        class="upload-input"
                                        #fileInput
                                    />
                                    <small class="upload-hint">PNG, JPG, JPEG • Max 5MB</small>
                                </div>
                            </div>
                            
                            <!-- Aperçu des photos -->
                            <div class="preview-grid" *ngIf="imagePreviews.length > 0">
                                <div class="preview-item" *ngFor="let img of imagePreviews; let i = index">
                                    <img [src]="img.previewUrl" alt="Aperçu" />
                                    <button class="preview-remove" (click)="removeImage(i)">
                                        ❌
                                    </button>
                                </div>
                            </div>
                            <small class="form-hint" *ngIf="imagePreviews.length > 0">
                                📸 {{ imagePreviews.length }} photo(s) sélectionnée(s)
                            </small>
                        </div>

                        <!-- Message d'erreur -->
                        @if (errorMessage) {
                            <div class="error-box">
                                <span>😊 {{ errorMessage }}</span>
                            </div>
                        }

                        <!-- Bouton de soumission -->
                        <div class="form-actions">
                            <button type="button" class="btn-cancel" (click)="cancel()">
                                ❌ Annuler
                            </button>
                            <button type="submit" class="btn-submit" [disabled]="loading">
                                <span *ngIf="!loading">✨ Publier le logement</span>
                                <span *ngIf="loading">⏳ Publication en cours...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .add-property-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1.5rem 2rem;
        }

        /* 🌟 EN-TÊTE */
        .page-header {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%);
            border-radius: 20px;
            padding: 1.5rem 2rem;
            margin-bottom: 1.5rem;
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
        }

        .step-badge {
            background: white;
            padding: 0.4rem 1.2rem;
            border-radius: 50px;
            font-size: 0.9rem;
            color: #666;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            font-weight: 500;
        }

        /* 📝 FORMULAIRE */
        .form-container {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .form-card {
            max-width: 100%;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2d1b69;
            font-size: 1rem;
        }

        .required {
            color: #ff6b6b;
        }

        ::ng-deep .form-group .p-inputtext,
        ::ng-deep .form-group .p-inputnumber,
        ::ng-deep .form-group .p-select {
            border-radius: 12px !important;
            border: 2px solid #e8e8e8 !important;
            transition: all 0.3s ease !important;
            width: 100% !important;
        }

        ::ng-deep .form-group .p-inputtext:focus,
        ::ng-deep .form-group .p-inputnumber:focus,
        ::ng-deep .form-group .p-select:focus {
            border-color: #ff6b6b !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
        }

        ::ng-deep .form-group .p-inputtext.ng-invalid.ng-dirty,
        ::ng-deep .form-group .p-inputnumber.ng-invalid.ng-dirty,
        ::ng-deep .form-group .p-select.ng-invalid.ng-dirty {
            border-color: #ff6b6b !important;
        }

        ::ng-deep .form-group .p-textarea {
            border-radius: 12px !important;
            border: 2px solid #e8e8e8 !important;
            transition: all 0.3s ease !important;
            min-height: 100px;
        }

        ::ng-deep .form-group .p-textarea:focus {
            border-color: #ff6b6b !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
        }

        .form-hint {
            display: block;
            font-size: 0.8rem;
            color: #888;
            margin-top: 0.3rem;
        }

        .form-error {
            display: block;
            font-size: 0.8rem;
            color: #ff6b6b;
            margin-top: 0.3rem;
        }

        /* 📸 UPLOAD */
        .upload-area {
            border: 2px dashed #d0d0d0;
            border-radius: 16px;
            padding: 2.5rem 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #fafafa;
            position: relative;
        }

        .upload-area:hover {
            border-color: #ff6b6b;
            background: #fff5f5;
        }

        .upload-area.dragover {
            border-color: #ff6b6b;
            background: #fff0f0;
            transform: scale(1.02);
        }

        .upload-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .upload-icon {
            font-size: 3rem;
        }

        .upload-text {
            color: #666;
            font-size: 1rem;
        }

        .upload-browse {
            color: #ff6b6b;
            font-weight: 600;
            cursor: pointer;
            padding: 0.3rem 1.5rem;
            border: 2px solid #ff6b6b;
            border-radius: 50px;
            transition: all 0.3s ease;
        }

        .upload-browse:hover {
            background: #ff6b6b;
            color: white;
        }

        .upload-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .upload-hint {
            color: #aaa;
            font-size: 0.8rem;
            margin-top: 0.3rem;
        }

        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.8rem;
            margin-top: 1rem;
        }

        .preview-item {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            aspect-ratio: 1;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .preview-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .preview-remove {
            position: absolute;
            top: 0.3rem;
            right: 0.3rem;
            border: none;
            background: rgba(0,0,0,0.5);
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-remove:hover {
            background: #ff6b6b;
            transform: scale(1.1);
        }

        /* ❌ ERREUR */
        .error-box {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: #d63031;
            margin-bottom: 1rem;
            text-align: center;
        }

        /* 🎯 BOUTONS */
        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1rem;
            padding-top: 1.5rem;
            border-top: 2px solid #f0f0f0;
        }

        .btn-cancel {
            padding: 0.6rem 2rem;
            border: 2px solid #e0e0e0;
            border-radius: 50px;
            background: white;
            color: #666;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-cancel:hover {
            background: #f5f5f5;
            border-color: #ccc;
        }

        .btn-submit {
            padding: 0.6rem 2.5rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(238, 90, 36, 0.4);
        }

        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* 📱 RESPONSIVE */
        @media (max-width: 768px) {
            .add-property-container {
                padding: 0 1rem 1rem;
            }

            .page-header {
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
                justify-content: flex-start;
            }

            .form-container {
                padding: 1.2rem;
            }

            .form-actions {
                flex-direction: column;
            }

            .btn-cancel,
            .btn-submit {
                width: 100%;
                text-align: center;
            }

            .preview-grid {
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            }
        }

        @media (max-width: 480px) {
            .upload-area {
                padding: 1.5rem 0.5rem;
            }

            .upload-icon {
                font-size: 2rem;
            }

            .upload-text {
                font-size: 0.9rem;
            }
        }
    `]
})
export class AddProperty {
    title = '';
    description = '';
    price: number | null = null;
    location = '';
    type = '';
    errorMessage = '';
    loading = false;
    dragOver = false;

    selectedFiles: File[] = [];
    imagePreviews: ImagePreview[] = [];

    typeOptions = [
        { label: '🏠 Appartement', value: 'appartement' },
        { label: '🏡 Villa', value: 'villa' },
        { label: '🏘️ Maison', value: 'maison' },
        { label: '🏢 Studio', value: 'studio' }
    ];

    propertyService = inject(PropertyService);
    authService = inject(AuthService);
    router = inject(Router);
    private messageService = inject(MessageService);

    onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;

        const files = Array.from(input.files);
        this.selectedFiles.push(...files);

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviews.push({ file, previewUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }

        input.value = '';
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.dragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
        const files = event.dataTransfer?.files;
        if (files) {
            const input = { target: { files } } as any;
            this.onFilesSelected(input);
        }
    }

    removeImage(index: number) {
        const removed = this.imagePreviews[index];
        this.imagePreviews.splice(index, 1);
        this.selectedFiles = this.selectedFiles.filter(f => f !== removed.file);
    }

    onSubmit() {
        this.errorMessage = '';

        if (!this.title || !this.description || !this.price || !this.location || !this.type) {
            this.errorMessage = '💝 Merci de remplir tous les champs';
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Champs manquants',
                detail: 'Veuillez remplir tous les champs obligatoires ✨'
            });
            return;
        }

        this.loading = true;

        this.propertyService.create({
            title: this.title,
            description: this.description,
            price: this.price,
            location: this.location,
            type: this.type
        }).pipe(
            switchMap(property => {
                if (this.selectedFiles.length === 0) {
                    return of(property);
                }
                const uploads = this.selectedFiles.map(file =>
                    this.propertyService.uploadImage(property._id, file).pipe(
                        catchError(() => of(null))
                    )
                );
                return forkJoin(uploads);
            })
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Super !',
                    detail: 'Votre logement a été publié avec succès ✨'
                });
                setTimeout(() => {
                    this.router.navigate(['/properties']);
                }, 1000);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.status === 403
                    ? '🔑 Seuls les propriétaires (owner) peuvent ajouter un logement'
                    : '😊 Erreur lors de la création du logement. Réessayez ?';
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: this.errorMessage
                });
            }
        });
    }

    cancel() {
        this.router.navigate(['/properties']);
    }
}