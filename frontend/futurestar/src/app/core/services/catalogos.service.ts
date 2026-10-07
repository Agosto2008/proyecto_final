import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  HabilidadesResponse,
  PaisesResponse,
} from '../models/catalogos.models';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private readonly api = inject(ApiService);

  listarHabilidades(
    categoria?: string,
  ): Observable<HabilidadesResponse> {
    let params = new HttpParams();

    if (categoria) {
      params = params.set('categoria', categoria);
    }

    return this.api.get<HabilidadesResponse>(
      '/catalogos/habilidades',
      params,
    );
  }

  listarPaises(): Observable<PaisesResponse> {
    return this.api.get<PaisesResponse>('/catalogos/paises');
  }

}