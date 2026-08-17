import { Component, inject, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Property, PropertyService } from '@/app/services/property';


@Component({
    standalone: true,
    selector: 'app-properties-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Logements disponibles</div>
        <p-table [value]="properties()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="title">Titre <p-sortIcon field="title"></p-sortIcon></th>
                    <th pSortableColumn="location">Localisation <p-sortIcon field="location"></p-sortIcon></th>
                    <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                    <th pSortableColumn="price">Prix / nuit <p-sortIcon field="price"></p-sortIcon></th>
                    <th>Voir</th>
                </tr>
            </ng-template>
            <ng-template #body let-property>
                <tr>
                    <td style="width: 30%; min-width: 8rem;">{{ property.title }}</td>
                    <td style="width: 20%; min-width: 6rem;">{{ property.location }}</td>
                    <td style="width: 20%; min-width: 6rem;">{{ property.type }}</td>
                    <td style="width: 20%; min-width: 6rem;">{{ property.price | currency: 'USD' }}</td>
                    <td style="width: 10%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class PropertiesWidget {
    properties = signal<Property[]>([]);

    propertyService = inject(PropertyService);

    ngOnInit() {
        this.propertyService.getAll().subscribe((data) => this.properties.set(data));
    }
}