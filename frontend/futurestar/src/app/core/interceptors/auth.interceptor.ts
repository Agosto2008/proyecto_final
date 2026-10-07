import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';

import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

let refrescandoToken = false;

export const authInterceptor: HttpInterceptorFn = (
 req,
  next,
) => {
  const authService = inject(AuthService);

  const accessToken =
    authService.obtenerAccessToken();

  const esLogin =
    req.url.includes('/auth/login');

  const esRefresh =
    req.url.includes('/auth/refresh');

  const esLogout =
    req.url.includes('/auth/logout');

  let request = req;

  if (
    accessToken &&
    !esLogin &&
    !esRefresh
  ) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        esLogin ||
        esRefresh ||
        esLogout ||
        refrescandoToken
      ) {
        return throwError(() => error);
      }

      refrescandoToken = true;

      return authService.refresh().pipe(
        switchMap((response) => {
          refrescandoToken = false;

          const nuevaPeticion = req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${response.accessToken}`,
            },
          });

          return next(nuevaPeticion);
        }),
        catchError((refreshError) => {
          refrescandoToken = false;

          authService.limpiarSesion();

          return throwError(
            () => refreshError,
          );
        }),
      );
    }),
  );
};