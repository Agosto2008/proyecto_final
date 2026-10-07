import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    'http://localhost:3000/api';

  get<T>(
    endpoint: string,
    params?: HttpParams,
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}${endpoint}`,
      {
        params,
        headers,
        withCredentials: true,
      },
    );
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      {
        headers,
        withCredentials: true,
      },
    );
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      {
        headers,
        withCredentials: true,
      },
    );
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.patch<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      {
        headers,
        withCredentials: true,
      },
    );
  }

  delete<T>(
    endpoint: string,
    headers?: HttpHeaders,
  ): Observable<T> {
    return this.http.delete<T>(
      `${this.baseUrl}${endpoint}`,
      {
        headers,
        withCredentials: true,
      },
    );
  }
}