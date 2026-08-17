import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Administration',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/dashboard/users'] },
                    { label: 'Logements', icon: 'pi pi-fw pi-building', routerLink: ['/dashboard/properties'] },
                    { label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard/stats'] }
                ]
            },
            {
                label: 'Navigation',
                items: [
                    { label: 'Voir les logements', icon: 'pi pi-fw pi-search', routerLink: ['/properties'] }
                ]
            }
        ];
    }
}