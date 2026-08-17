import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { PropertyService } from '../../services/property';
import { AuthService } from '../../services/auth';

interface ImagePreview {
    file: File;
    previewUrl: string;
}

@Component({
    selector: 'app-add-property',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, TextareaModule, ButtonModule],
    template: `
        <div class="card max-w-2xl mx-auto mt-8">
            <div class="font-semibold text-xl mb-4">Ajouter un logement</div>

            <label class="block mb-2">Titre</label>
            <input pInputText [(ngModel)]="title" class="w-full mb-4" />

            <label class="block mb-2">Description</label>
            <textarea pTextarea [(ngModel)]="description" rows="4" class="w-full mb-4"></textarea>

            <label class="block mb-2">Prix par nuit </label>
<p-inputNumber [(ngModel)]="price" mode="currency" currency="TND" [min]="0" styleClass="w-full mb-4"></p-inputNumber>
            <label class="block mb-2">Localisation</label>
            <input pInputText [(ngModel)]="location" class="w-full mb-4" />

            <label class="block mb-2">Type</label>
            <input pInputText [(ngModel)]="type" placeholder="appartement, maison, studio..." class="w-full mb-4" />

            <label class="block mb-2">Photos</label>
            <input
                type="file"
                accept="image/*"
                multiple
                (change)="onFilesSelected($event)"
                class="w-full mb-2"
            />

            @if (imagePreviews.length > 0) {
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    @for (img of imagePreviews; track img.previewUrl; let i = $index) {
                        <div class="relative">
                            <img [src]="img.previewUrl" class="w-full h-24 object-cover rounded" />
                            <button
                                type="button"
                                (click)="removeImage(i)"
                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer border-none"
                            >
                                ✕
                            </button>
                        </div>
                    }
                </div>
            }

            @if (errorMessage) {
                <p class="text-red-500 mb-4">{{ errorMessage }}</p>
            }

            <p-button
                label="Publier le logement"
                icon="pi pi-home"
                (onClick)="onSubmit()"
                [loading]="loading"
                [disabled]="loading">
            </p-button>
        </div>
    `
})
export class AddProperty {
    title = '';
    description = '';
    price: number | null = null;
    location = '';
    type = '';
    errorMessage = '';
    loading = false;

    selectedFiles: File[] = [];
    imagePreviews: ImagePreview[] = [];

    propertyService = inject(PropertyService);
    authService = inject(AuthService);
    router = inject(Router);

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

    removeImage(index: number) {
        const removed = this.imagePreviews[index];
        this.imagePreviews.splice(index, 1);
        this.selectedFiles = this.selectedFiles.filter(f => f !== removed.file);
    }

    onSubmit() {
        this.errorMessage = '';

        if (!this.title || !this.description || !this.price || !this.location || !this.type) {
            this.errorMessage = 'Merci de remplir tous les champs';
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
            next: () => this.router.navigate(['/properties']),
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.status === 403
                    ? 'Seuls les propriétaires (owner) peuvent ajouter un logement'
                    : 'Erreur lors de la création du logement';
            }
        });
    }
}