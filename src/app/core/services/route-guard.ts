import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const routeGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.parseUrl('/');
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const hasAllowedRole = allowedRoles.some(role =>
    authService.hasRole(role)
  );

  if (hasAllowedRole) {
    return true;
  }

  return router.parseUrl('/events'); //send registered users to events if they try to access a page they can't
};
