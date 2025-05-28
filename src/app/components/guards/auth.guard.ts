import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { AuthService } from './../../services/auth.service';

export const authGuard = () => {
  return async() => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const token = localStorage.getItem('accessToken');

    if (!token) {
        return router.navigate(['/login']);
    }

    const request = authService.getUser();
    const repsonse = await lastValueFrom(request);

    if (repsonse.status !== 200) {
        return router.navigate(['/login']);
    }

    const user = repsonse.data;

    if (!user || !user.enabled) {
        return router.navigate(['/login']);
    }

    return true;

  }
}
