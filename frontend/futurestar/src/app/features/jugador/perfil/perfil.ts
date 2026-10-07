import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Router,
} from '@angular/router';

import {
  JugadoresService,
} from '../../../core/services/jugadores.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly jugadoresService =
    inject(JugadoresService);

  private readonly router =
    inject(Router);

  cargando = true;
  guardando = false;

  mensaje = '';
  error = '';

  perfilForm = this.fb.nonNullable.group({

    nombre_deportivo: [
      '',
      [
        Validators.maxLength(100),
      ],
    ],

    posicion_principal: [
      '',
      [
        Validators.maxLength(100),
      ],
    ],

    posicion_secundaria: [
      '',
      [
        Validators.maxLength(100),
      ],
    ],

    categoria: [
      '',
      [
        Validators.maxLength(100),
      ],
    ],

    altura_cm: [
      null as number | null,
      [
        Validators.min(100),
        Validators.max(260),
      ],
    ],

    peso_kg: [
      null as number | null,
      [
        Validators.min(25),
        Validators.max(200),
      ],
    ],

    pierna_dominante: [
      null as 'IZQUIERDA' | 'DERECHA' | 'AMBAS' | null,
    ],

    experiencia: [
      '',
    ],

    descripcion: [
      '',
    ],

    perfil_publico: [
      false,
    ],
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {

    this.cargando = true;
    this.error = '';

    this.jugadoresService
      .obtenerMiPerfil()
      .subscribe({

        next: (response) => {

          const perfil = response.data;

          this.perfilForm.patchValue({
            nombre_deportivo:
              perfil.nombre_deportivo ?? '',

            posicion_principal:
              perfil.posicion_principal ?? '',

            posicion_secundaria:
              perfil.posicion_secundaria ?? '',

            categoria:
              perfil.categoria ?? '',

            altura_cm:
              perfil.altura_cm,

            peso_kg:
              perfil.peso_kg,

            pierna_dominante:
              perfil.pierna_dominante,

            experiencia:
              perfil.experiencia ?? '',

            descripcion:
              perfil.descripcion ?? '',

            perfil_publico:
              perfil.perfil_publico,
          });

          this.cargando = false;
        },

        error: (error) => {

          console.error(
            'Error al cargar perfil:',
            error,
          );

          this.cargando = false;

          this.error =
            'No se pudo cargar tu perfil.';
        },
      });
  }

  guardarPerfil(): void {

    this.mensaje = '';
    this.error = '';

    if (this.perfilForm.invalid) {

      this.perfilForm.markAllAsTouched();

      return;
    }

    this.guardando = true;

    const datos =
      this.perfilForm.getRawValue();

    this.jugadoresService
      .guardarMiPerfil(datos)
      .subscribe({

        next: () => {

          this.guardando = false;

          this.mensaje =
            'Tu perfil se guardó correctamente.';
        },

        error: (error) => {

          console.error(
            'Error al guardar perfil:',
            error,
          );

          this.guardando = false;

          if (error.status === 400) {
            this.error =
              'Los datos enviados no son válidos.';
            return;
          }

          if (error.status === 401) {

            this.router.navigate([
              '/login',
            ]);

            return;
          }

          this.error =
            'No se pudo guardar el perfil.';
        },
      });
  }

  volver(): void {

    this.router.navigate([
      '/jugador',
    ]);
  }
}