// src/app/pages/add-property/add-property.ts
import { Component, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import * as L from 'leaflet';

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
                    <form #propertyForm="ngForm" (ngSubmit)="onSubmit()">
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
                                minlength="3"
                                maxlength="100"
                                placeholder="Donnez un titre attractif à votre logement..."
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': titleInput.invalid && titleInput.dirty}"
                            />
                            <small class="form-hint" *ngIf="!titleInput.invalid || !titleInput.dirty">
                                ✨ 3 à 100 caractères
                            </small>
                            <small class="form-error" *ngIf="titleInput.invalid && titleInput.dirty">
                                <span *ngIf="titleInput.errors?.['required']">⚠️ Le titre est obligatoire</span>
                                <span *ngIf="titleInput.errors?.['minlength']">⚠️ Minimum 3 caractères</span>
                                <span *ngIf="titleInput.errors?.['maxlength']">⚠️ Maximum 100 caractères</span>
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
                                minlength="10"
                                maxlength="2000"
                                rows="4"
                                placeholder="Décrivez votre logement en quelques mots..."
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': descInput.invalid && descInput.dirty}"
                            ></textarea>
                            <small class="form-hint" *ngIf="!descInput.invalid || !descInput.dirty">
                                💭 10 à 2000 caractères
                            </small>
                            <small class="form-error" *ngIf="descInput.invalid && descInput.dirty">
                                <span *ngIf="descInput.errors?.['required']">⚠️ La description est obligatoire</span>
                                <span *ngIf="descInput.errors?.['minlength']">⚠️ Minimum 10 caractères</span>
                                <span *ngIf="descInput.errors?.['maxlength']">⚠️ Maximum 2000 caractères</span>
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
                                [max]="99999999"
                                placeholder="ex: 120"
                                styleClass="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': priceInput.invalid && priceInput.dirty}"
                            ></p-inputNumber>
                            <small class="form-hint" *ngIf="!priceInput.invalid || !priceInput.dirty">
                                💎 Prix en TND
                            </small>
                            <small class="form-error" *ngIf="priceInput.invalid && priceInput.dirty">
                                <span *ngIf="priceInput.errors?.['required']">⚠️ Le prix est obligatoire</span>
                                <span *ngIf="priceInput.errors?.['min']">⚠️ Le prix doit être supérieur à 0</span>
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
                                minlength="2"
                                maxlength="100"
                                placeholder="ex: Tunis, Sousse..."
                                class="w-full"
                                [ngClass]="{'ng-invalid ng-dirty': locInput.invalid && locInput.dirty}"
                            />
                            <small class="form-hint" *ngIf="!locInput.invalid || !locInput.dirty">
                                🌍 2 à 100 caractères
                            </small>
                            <small class="form-error" *ngIf="locInput.invalid && locInput.dirty">
                                <span *ngIf="locInput.errors?.['required']">⚠️ La localisation est obligatoire</span>
                                <span *ngIf="locInput.errors?.['minlength']">⚠️ Minimum 2 caractères</span>
                            </small>
                        </div>

                        <!-- 🗺️ POSITION EXACTE SUR LA CARTE -->
                        <div class="form-group">
                            <label class="form-label">
                                🗺️ Position exacte sur la carte
                            </label>
                            <div class="map-search-row">
                                <input
                                    pInputText
                                    [(ngModel)]="mapSearchQuery"
                                    name="mapSearchQuery"
                                    placeholder="Rechercher une adresse pour centrer la carte..."
                                    class="w-full"
                                    (keydown.enter)="$event.preventDefault(); searchAddress()"
                                />
                                <button type="button" class="btn-search-map" (click)="searchAddress()">
                                    🔍
                                </button>
                            </div>
                            <div #mapContainer class="add-property-map"></div>
                            <small class="form-hint" *ngIf="latitude === null">
                                📌 Cliquez sur la carte à l'endroit exact du logement (obligatoire pour l'itinéraire précis)
                            </small>
                            <small class="form-hint map-coords" *ngIf="latitude !== null && longitude !== null">
                                ✅ Position choisie : {{ latitude!.toFixed(5) }}, {{ longitude!.toFixed(5) }}
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
                                optionLabel="label"
                                optionValue="value"
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

                        @if (errorMessage) {
                            <div class="error-box">
                                <span>😊 {{ errorMessage }}</span>
                            </div>
                        }

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

        .map-coords {
            color: #00b894;
            font-weight: 600;
        }

        .form-error {
            display: block;
            font-size: 0.8rem;
            color: #ff6b6b;
            margin-top: 0.3rem;
        }

        /* 🗺️ CARTE DE SÉLECTION */
        .map-search-row {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.6rem;
        }

        .btn-search-map {
            border: 2px solid #e8e8e8;
            border-radius: 12px;
            background: white;
            padding: 0 1rem;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .btn-search-map:hover {
            border-color: #ff6b6b;
            background: #fff5f5;
        }

        .add-property-map {
            width: 100%;
            height: 300px;
            border-radius: 16px;
            overflow: hidden;
            border: 2px solid #e8e8e8;
            cursor: crosshair;
        }

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

        .error-box {
            background: #fff5f5;
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: #d63031;
            margin-bottom: 1rem;
            text-align: center;
        }

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

            .add-property-map {
                height: 220px;
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
export class AddProperty implements AfterViewInit {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    title = '';
    description = '';
    price: number | null = null;
    location = '';
    type = '';
    errorMessage = '';
    loading = false;
    dragOver = false;

    // 🗺️ Position GPS
    mapSearchQuery = '';
    latitude: number | null = null;
    longitude: number | null = null;
    private map: L.Map | null = null;
    private marker: L.Marker | null = null;

    // Centre par défaut : Tunisie
    private readonly DEFAULT_LAT = 34.0;
    private readonly DEFAULT_LNG = 9.5;
    private readonly DEFAULT_ZOOM = 6;

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

    ngAfterViewInit() {
        this.initMap();
    }

    private initMap() {
        this.map = L.map(this.mapContainer.nativeElement).setView(
            [this.DEFAULT_LAT, this.DEFAULT_LNG],
            this.DEFAULT_ZOOM
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.setMarker(e.latlng.lat, e.latlng.lng);
        });

        // Corrige un bug fréquent de Leaflet dans une carte cachée au chargement
        setTimeout(() => this.map?.invalidateSize(), 200);
    }

    private setMarker(lat: number, lng: number) {
        this.latitude = lat;
        this.longitude = lng;

        if (!this.map) return;

        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => {
                const pos = this.marker!.getLatLng();
                this.latitude = pos.lat;
                this.longitude = pos.lng;
            });
        }
    }

    searchAddress() {
        if (!this.mapSearchQuery.trim()) return;

        const query = encodeURIComponent(this.mapSearchQuery.trim());
        fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
            .then(res => res.json())
            .then(results => {
                if (results && results.length > 0) {
                    const lat = parseFloat(results[0].lat);
                    const lon = parseFloat(results[0].lon);
                    this.map?.setView([lat, lon], 15);
                    this.setMarker(lat, lon);
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: '😊 Adresse introuvable',
                        detail: 'Essayez une recherche plus précise, ou cliquez directement sur la carte'
                    });
                }
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de rechercher cette adresse pour le moment'
                });
            });
    }

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
        this.loading = true;

        if (!this.title || this.title.trim().length < 3) {
            this.errorMessage = '📝 Le titre doit contenir au moins 3 caractères';
            this.loading = false;
            return;
        }

        if (!this.description || this.description.trim().length < 10) {
            this.errorMessage = '📖 La description doit contenir au moins 10 caractères';
            this.loading = false;
            return;
        }

        if (!this.price || this.price <= 0) {
            this.errorMessage = '💰 Le prix doit être supérieur à 0';
            this.loading = false;
            return;
        }

        if (!this.location || this.location.trim().length < 2) {
            this.errorMessage = '📍 La localisation est obligatoire';
            this.loading = false;
            return;
        }

        if (!this.type) {
            this.errorMessage = '🏷️ Le type de logement est obligatoire';
            this.loading = false;
            return;
        }

        this.propertyService.create({
            title: this.title.trim(),
            description: this.description.trim(),
            price: this.price,
            location: this.location.trim(),
            type: this.type,
            latitude: this.latitude ?? undefined,
            longitude: this.longitude ?? undefined
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
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Super !',
                    detail: 'Votre logement a été publié avec succès ✨'
                });
                setTimeout(() => {
                    this.router.navigate(['/my-properties']);
                }, 1500);
            },
            error: (err) => {
                this.loading = false;
                
                if (err.status === 422) {
                    const detail = err.error?.detail;
                    if (Array.isArray(detail) && detail.length > 0) {
                        const messages = detail.map((e: any) => {
                            const field = e.loc?.join('.') || '';
                            const msg = e.msg || '';
                            return `${field}: ${msg}`;
                        });
                        this.errorMessage = '😊 ' + messages.join('. ');
                    } else if (typeof detail === 'string') {
                        this.errorMessage = '😊 ' + detail;
                    } else {
                        this.errorMessage = '😊 Veuillez vérifier vos informations';
                    }
                } else if (err.status === 403) {
                    this.errorMessage = '🔑 Seuls les propriétaires (owner) peuvent ajouter un logement';
                } else {
                    this.errorMessage = '😊 Erreur lors de la création du logement. Réessayez ?';
                }
            }
        });
    }

    cancel() {
        this.router.navigate(['/properties']);
    }
}