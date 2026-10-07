import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  Router,
} from '@angular/router';

import {
  AuthService,
} from '../../core/services/auth.service';

import {
  JugadoresService,
} from '../../core/services/jugadores.service';

import {
  Usuario,
} from '../../core/models/auth.models';

import {
  PerfilJugador,
} from '../../core/models/jugador.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private readonly authService =
    inject(AuthService);

  private readonly jugadoresService =
    inject(JugadoresService);

  private readonly router =
    inject(Router);

  usuario: Usuario | null = null;

  perfil: PerfilJugador | null = null;

  cargando = true;

  error = '';

  ngOnInit(): void {

    this.usuario =
      this.authService.obtenerUsuario();

    this.cargarPerfil();
  }

  private cargarPerfil(): void {

    this.cargando = true;
    this.error = '';

    this.jugadoresService
      .obtenerMiPerfil()
      .subscribe({

        next: (response) => {

          this.perfil =
            response.data;

          this.cargando = false;
        },

        error: (error) => {

          console.error(
            'Error al obtener el perfil:',
            error,
          );

          this.cargando = false;

          if (error.status === 401) {

            this.authService
              .limpiarSesion();

            this.router.navigate([
              '/login',
            ]);

            return;
          }

          if (error.status === 403) {

            this.error =
              'Tu cuenta no tiene permisos de jugador.';

            return;
          }

          this.error =
            'No se pudo cargar tu perfil.';
        },
      });
  }

  get nombreCompleto(): string {

    if (!this.usuario) {
      return 'Jugador';
    }

    return `${this.usuario.nombre} ${this.usuario.apellido}`;
  }

  get nombreDeportivo(): string {

    return (
      this.perfil?.nombre_deportivo ||
      'Sin nombre deportivo'
    );
  }

  get posicion(): string {

    return (
      this.perfil?.posicion_principal ||
      'Sin posición'
    );
  }

  get estadoPerfil(): string {

    return (
      this.perfil?.estado_perfil ||
      'BORRADOR'
    );
  }

  irAPerfil(): void {
  this.router.navigate([
    '/jugador/perfil',
  ]);
}

  get cantidadHabilidades(): number {

    return (
      this.perfil?.habilidades?.length ||
      0
    );
  }

  get perfilPublico(): boolean {

    return (
      this.perfil?.perfil_publico ??
      false
    );
  }

  cerrarSesion(): void {

    this.authService
      .logout()
      .subscribe({

        next: () => {

          this.router.navigate([
            '/login',
          ]);
        },

        error: () => {

          this.authService
            .limpiarSesion();

          this.router.navigate([
            '/login',
          ]);
        },
      });
  }
}