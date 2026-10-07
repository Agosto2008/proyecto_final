import {
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { Pais } from '../../../core/models/catalogos.models';
import {
  RegistroRequest,
  RolRegistro,
} from '../../../core/models/auth.models';

function passwordsIguales(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmar = group.get('confirmar')?.value;

  return password === confirmar ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['../login/login.css', './registro.css'],
})
export class Registro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly paises = signal<Pais[]>([]);
  readonly cargandoPaises = signal(true);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly mostrarPassword = signal(false);

  readonly hoy = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group(
    {
      rol: ['JUGADOR' as RolRegistro, [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(150)],
      ],
      telefono: [
        '',
        [Validators.pattern(/^\+?[0-9\s-]{6,30}$/)],
      ],
      fecha_nacimiento: ['', [Validators.required]],
      pais_id: ['', [Validators.required]],
      ciudad: ['', [Validators.maxLength(100)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      ],
      confirmar: ['', [Validators.required]],
    },
    { validators: passwordsIguales },
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.catalogos.listarPaises().subscribe({
      next: (res) => {
        this.paises.set(res.data);
        this.cargandoPaises.set(false);
      },
      error: () => {
        this.cargandoPaises.set(false);
        this.error.set(
          'No se pudo cargar la lista de países. Recarga la página.',
        );
      },
    });
  }

  elegirRol(rol: RolRegistro): void {
    this.form.controls.rol.setValue(rol);
  }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  invalido(nombre: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[nombre];
    return control.invalid && control.touched;
  }

  get noCoinciden(): boolean {
    return (
      this.form.hasError('noCoinciden') &&
      this.form.controls.confirmar.touched
    );
  }

  private calcularEdad(fecha: string): number {
    const [y, m, d] = fecha.split('-').map(Number);
    const hoy = new Date();
    let edad = hoy.getFullYear() - y;

    if (
      hoy.getMonth() + 1 < m ||
      (hoy.getMonth() + 1 === m && hoy.getDate() < d)
    ) {
      edad--;
    }

    return edad;
  }

  registrar(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (
      v.rol === 'CAZATALENTOS' &&
      this.calcularEdad(v.fecha_nacimiento) < 18
    ) {
      this.form.controls.fecha_nacimiento.markAsTouched();
      this.error.set('Los cazatalentos deben ser mayores de edad.');
      return;
    }

    const body: RegistroRequest = {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      email: v.email.trim(),
      password: v.password,
      fecha_nacimiento: v.fecha_nacimiento,
      pais_id: Number(v.pais_id),
      rol: v.rol,
    };

    if (v.telefono.trim()) {
      body.telefono = v.telefono.trim();
    }

    if (v.ciudad.trim()) {
      body.ciudad = v.ciudad.trim();
    }

    this.cargando.set(true);

    this.authService.registro(body).subscribe({
      next: () => this.iniciarSesionAutomatica(body),
      error: (err) => {
        console.error('Error de registro:', err);
        this.cargando.set(false);

        if (err.status === 409) {
          this.error.set('Ese correo ya está registrado.');
        } else if (err.status === 429) {
          this.error.set(
            'Demasiados intentos. Espera un momento e inténtalo nuevamente.',
          );
        } else if (err.status === 0) {
          this.error.set(
            'No se pudo conectar con FutureStar. Verifica que el backend esté funcionando.',
          );
        } else if (err.status === 400 || err.status === 422) {
          this.error.set(
            'Algún dato no es válido. Revisa el formulario e inténtalo de nuevo.',
          );
        } else {
          this.error.set(
            'Ocurrió un error al crear la cuenta. Inténtalo nuevamente.',
          );
        }
      },
    });
  }

  private iniciarSesionAutomatica(body: RegistroRequest): void {
    this.authService
      .login({ email: body.email, password: body.password })
      .subscribe({
        next: (res) => {
          this.cargando.set(false);

          this.router.navigate([
            res.usuario.roles.includes('JUGADOR')
              ? '/jugador'
              : '/cazatalentos',
          ]);
        },
        error: () => {
          // La cuenta ya se creó; solo falló el inicio automático.
          this.cargando.set(false);
          this.router.navigate(['/login']);
        },
      });
  }
}