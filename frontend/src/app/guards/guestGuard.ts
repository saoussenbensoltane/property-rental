import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        const role = authService.getRole();

        if (role === 'admin') {
            router.navigate(['/dashboard']);
        } else if (role === 'owner') {
            router.navigate(['/my-properties']);
        } else {
            router.navigate(['/properties']);
        }

        return false;
    }

    return true;
};