import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './../../services/user.service';

export const authGuard = (isAdmin: boolean) => {
  return async() => {
    const router = inject(Router);
    const userService = inject(UserService);

    const token = localStorage.getItem('accessToken');

    if (!token) {
      return router.navigate(['/login']);
    }

    let user = userService.user();

    if (!user) {
      await userService.setUserFromDatabase();

      user = userService.user();
    }

    if (isAdmin && user!.enabled) {
      return true;
    } else {
      return false;
    }

  }
}
