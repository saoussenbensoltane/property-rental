// app.routes.ts
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
import { MyProperties } from './app/pages/my-properties/my-properties';
import { OwnerBookings } from './app/pages/owner-bookings/owner-bookings';
import { PropertyDetail } from './app/pages/property-detail/property-detail';
import { AdminUsers } from './app/pages/admin/admin-users/admin-users';
import { AdminProperties } from './app/pages/admin/admin-properties/admin-properties';
import { AdminStats } from './app/pages/admin/admin-stats/admin-stats';

export const appRoutes: Routes = [
    // ✅ Redirection par défaut (sera gérée par le guard)
    { path: '', redirectTo: '/properties', pathMatch: 'full' },
  
    // 📋 Pages publiques
    { path: 'properties', component: Properties },
    { path: 'properties/:id', component: PropertyDetail },
    { path: 'landing', component: Landing },
    
    // 🔒 Pages protégées (authentification requise)
    { path: 'add-property', component: AddProperty, canActivate: [authGuard] },
    { path: 'my-bookings', component: MyBookings, canActivate: [authGuard] },
    { path: 'my-properties', component: MyProperties, canActivate: [authGuard] },
    { path: 'owner-bookings', component: OwnerBookings, canActivate: [authGuard] },
    
    // 🤖 AI Price Prediction (LAZY LOADING - Fixed)
    {
        path: 'ai-price',
        loadComponent: () => import('./app/pages/ai-price/ai-price').then(m => m.AIPrice),
        canActivate: [authGuard]
    },
    
    // 👑 Administration
    {
        path: 'dashboard',
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
    
    // 🔐 Authentification
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    
    // ❌ 404
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];