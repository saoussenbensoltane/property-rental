import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { PropertyService, Property } from '../../services/property';
import { Header } from '@/app/shared/header';


@Component({
    selector: 'app-property-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule, CarouselModule, Header],
    template: `
        <app-header></app-header>
        @if (property()) {
            <div class="max-w-3xl mx-auto px-6">
                @if (property()!.images && property()!.images.length > 0) {
                    <p-carousel
                        [value]="property()!.images"
                        [numVisible]="1"
                        [numScroll]="1"
                        [circular]="true"
                        [showIndicators]="true"
                        [showNavigators]="property()!.images.length > 1"
                        styleClass="mb-6"
                    >
                        <ng-template let-image #item>
                            <img [src]="image" class="w-full h-80 object-cover rounded" />
                        </ng-template>
                    </p-carousel>
                } @else {
                    <div class="w-full h-80 bg-surface-100 dark:bg-surface-800 rounded mb-6 flex items-center justify-center text-surface-400">
                        Aucune photo disponible
                    </div>
                }

                <h1 class="text-3xl font-bold mb-2">{{ property()!.title }}</h1>
                <p class="text-xl text-surface-500 mb-4">{{ property()!.location }} — {{ property()!.type }}</p>
                <p class="mb-6">{{ property()!.description }}</p>
                <p class="text-2xl font-bold">{{ property()!.price | currency: 'TND' }} / nuit</p>
            </div>
        }
    `
})
export class PropertyDetail {
    property = signal<Property | null>(null);

    propertyService = inject(PropertyService);
    route = inject(ActivatedRoute);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.propertyService.getById(id).subscribe((data) => this.property.set(data));
        }
    }
}