import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/components/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { Properties } from './app/pages/properties/properties';
import { authGuard } from './app/guards/auth-guard';
import { AddProperty } from './app/pages/add-property/add-property';
import { MyBookings } from './app/pages/my-bookings/my-bookings';
import { OwnerBookings } from './app/pages/owner-bookings/owner-bookings';
import { PropertyDetail } from './app/pages/property-detail/property-detail';
import { AdminUsers } from './app/pages/admin/admin-users/admin-users';
import { AdminProperties } from './app/pages/admin/admin-properties/admin-properties';
import { AdminStats } from './app/pages/admin/admin-stats/admin-stats';
export const appRoutes: Routes = [
    { path: '', redirectTo: '/properties', pathMatch: 'full' },
    { path: 'properties', component: Properties },
    { path: 'add-property', component: AddProperty, canActivate: [authGuard] },
    { path: 'my-bookings', component: MyBookings, canActivate: [authGuard] },
    { path: 'owner-bookings', component: OwnerBookings, canActivate: [authGuard] },
    { path: 'properties/:id', component: PropertyDetail },
        {path: 'dashboard',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'users', component: AdminUsers },
{ path: 'properties', component: AdminProperties },
{ path: 'stats', component: AdminStats },
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];