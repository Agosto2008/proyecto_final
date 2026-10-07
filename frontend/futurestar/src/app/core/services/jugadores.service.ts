import {
  Injectable,
  inject,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  ApiService,
} from './api.service';

import {
  JugadorMeResponse,
  PerfilJugador,
} from '../models/jugador.models';

@Injectable({
  providedIn: 'root',
})
export class JugadoresService {

  private readonly api =
    inject(ApiService);

  obtenerMiPerfil(): Observable<JugadorMeResponse> {
    return this.api.get<JugadorMeResponse>(
      '/jugadores/me',
    );
  }

  guardarMiPerfil(
    datos: Partial<PerfilJugador>,
  ): Observable<JugadorMeResponse> {
    return this.api.put<JugadorMeResponse>(
      '/jugadores/me',
      datos,
    );
  }
}