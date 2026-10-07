import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { JugadoresService } from '../../../core/services/jugadores.service';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilJugador } from '../../../core/models/jugador.models';
import { Usuario } from '../../../core/models/auth.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  encapsulation: ViewEncapsulation.None // Fuerza a que los estilos se apliquen a todo el HTML del componente
})
export class PerfilComponent implements OnInit {
  private readonly jugadoresService = inject(JugadoresService);
  private readonly authService = inject(AuthService);

  usuario: Usuario | null = null;
  perfil: PerfilJugador | null = null;
  cargando = true;

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario();

    this.jugadoresService.obtenerMiPerfil().subscribe({
      next: (res) => {
        this.perfil = res.data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.cargando = false;
      }
    });
  }
}