import {
  Injectable,
  inject,
  PLATFORM_ID,
} from '@angular/core';

import {
  isPlatformBrowser,
} from '@angular/common';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
  tap,
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  Usuario,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly platformId =
    inject(PLATFORM_ID);

  private readonly API_URL =
    'http://localhost:3000/api/auth';

  private readonly ACCESS_TOKEN_KEY =
    'futurestar_access_token';

  private readonly USER_KEY =
    'futurestar_usuario';

  private get esNavegador(): boolean {
    return isPlatformBrowser(
      this.platformId,
    );
  }

  login(
    datos: LoginRequest,
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        datos,
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          this.guardarSesion(response);
        }),
      );
  }

  me(): Observable<{ usuario: Usuario }> {

    return this.http.get<{
      usuario: Usuario;
    }>(
      `${this.API_URL}/me`,
      {
        withCredentials: true,
      },
    );
  }

  refresh(): Observable<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {

    return this.http
      .post<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
      }>(
        `${this.API_URL}/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          this.guardarAccessToken(
            response.accessToken,
          );
        }),
      );
  }

  logout(): Observable<void> {

    return this.http
      .post<void>(
        `${this.API_URL}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.limpiarSesion();
        }),
      );
  }

  obtenerAccessToken(): string | null {

    if (!this.esNavegador) {
      return null;
    }

    return sessionStorage.getItem(
      this.ACCESS_TOKEN_KEY,
    );
  }

  obtenerUsuario(): Usuario | null {

    if (!this.esNavegador) {
      return null;
    }

    const usuario =
      sessionStorage.getItem(
        this.USER_KEY,
      );

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(
        usuario,
      ) as Usuario;
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {

    return !!this.obtenerAccessToken();
  }

  guardarSesion(
    response: LoginResponse,
  ): void {

    if (!this.esNavegador) {
      return;
    }

    this.guardarAccessToken(
      response.accessToken,
    );

    sessionStorage.setItem(
      this.USER_KEY,
      JSON.stringify(response.usuario),
    );
  }

  guardarAccessToken(
    accessToken: string,
  ): void {

    if (!this.esNavegador) {
      return;
    }

    sessionStorage.setItem(
      this.ACCESS_TOKEN_KEY,
      accessToken,
    );
  }

  limpiarSesion(): void {

    if (!this.esNavegador) {
      return;
    }

    sessionStorage.removeItem(
      this.ACCESS_TOKEN_KEY,
    );

    sessionStorage.removeItem(
      this.USER_KEY,
    );
  }
}