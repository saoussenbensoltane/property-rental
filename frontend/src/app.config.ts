// src/app/app.config.ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { authInterceptor } from './app/interceptors/auth.interceptor';

registerLocaleData(localeFr, 'fr-TN');

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes, 
            withInMemoryScrolling({ 
                anchorScrolling: 'enabled', 
                scrollPositionRestoration: 'enabled' 
            }), 
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor]) // 👈 Ajouter l'interceptor
        ),
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        providePrimeNG({ 
            theme: { 
                preset: Aura, 
                options: { 
                    darkModeSelector: '.app-dark' 
                } 
            } 
        }),
        { provide: LOCALE_ID, useValue: 'fr-TN' }
    ]
};