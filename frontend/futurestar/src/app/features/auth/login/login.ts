import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  mostrarPassword = false;
  cargando = false;
  error = '';

  loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
      ],
    ],
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(): void {
    this.error = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const datos = this.loginForm.getRawValue();

    this.authService.login(datos).subscribe({
      next: (response) => {
        this.cargando = false;

        console.log('Login exitoso:', response.usuario);

        const roles = response.usuario.roles;

        if (roles.includes('JUGADOR')) {
          this.router.navigate(['/jugador']);
          return;
        }

        if (roles.includes('CAZATALENTOS')) {
          this.router.navigate(['/cazatalentos']);
          return;
        }

        if (roles.includes('ORGANIZACION')) {
          this.router.navigate(['/organizacion']);
          return;
        }

        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin']);
          return;
        }

        this.router.navigate(['/']);
      },

      error: (error) => {
        console.error('Error de login:', error);

        this.cargando = false;

        if (error.status === 401) {
          this.error =
            'Correo o contraseña incorrectos.';
        } else if (error.status === 403) {
          this.error =
            'Esta cuenta no está disponible. Contacta a soporte.';
        } else if (error.status === 429) {
          this.error =
            'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
        } else if (error.status === 0) {
          this.error =
            'No se pudo conectar con FutureStar. Verifica que el backend esté funcionando.';
        } else {
          this.error =
            'Ocurrió un error al iniciar sesión. Inténtalo nuevamente.';
        }
      },
    });
  }
}