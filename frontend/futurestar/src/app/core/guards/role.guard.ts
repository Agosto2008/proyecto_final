import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
} from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.obtenerUsuario();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos =
    route.data['roles'] as string[] | undefined;

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  const tieneRol = usuario.roles.some((rol) =>
    rolesPermitidos.includes(rol),
  );

  if (tieneRol) {
    return true;
  }

  return router.createUrlTree(['/']);
};