import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { JugadoresService } from '../../../core/services/jugadores.service';
import { ApiService } from '../../../core/services/api.service';
import { Habilidad, HabilidadesResponse } from '../../../core/models/catalogos.models';
import { PerfilJugador, GuardarHabilidadesRequest } from '../../../core/models/jugador.models';

interface HabilidadConValor extends Habilidad {
  nivel: number;
  experiencia_anios: number | null;
  seleccionada: boolean;
}

@Component({
  selector: 'app-habilidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habilidades.html',
  styleUrl: './habilidades.css',
})
export class HabilidadesComponent implements OnInit {
  private readonly jugadoresService = inject(JugadoresService);
  private readonly apiService = inject(ApiService);

  cargando = true;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  habilidadesPorCategoria: { [categoria: string]: HabilidadConValor[] } = {};
  categorias: string[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.apiService.get<HabilidadesResponse>('/catalogos/habilidades').subscribe({
      next: (catRes) => {
        const catalogo = catRes.data || [];

        this.jugadoresService.obtenerMiPerfil().subscribe({
          next: (perfilRes) => {
            const perfil = perfilRes.data;
            this.mapearHabilidades(catalogo, perfil.habilidades || []);
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al obtener perfil:', err);
            this.mensajeError = 'No se pudo cargar la información del perfil.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener catálogo de habilidades:', err);
        this.mensajeError = 'Error al cargar el catálogo de habilidades.';
        this.cargando = false;
      }
    });
  }

  private mapearHabilidades(catalogo: Habilidad[], habilidadesExistentes: any[]): void {
    const mapaExistentes = new Map<number, any>();
    habilidadesExistentes.forEach(h => mapaExistentes.set(h.habilidad_id, h));

    const agrupadas: { [categoria: string]: HabilidadConValor[] } = {};

    catalogo.filter(h => h.activa).forEach(h => {
      const existente = mapaExistentes.get(h.id);
      const catName = h.categoria || 'General';

      const item: HabilidadConValor = {
        ...h,
        nivel: existente ? existente.nivel : 50,
        experiencia_anios: existente ? existente.experiencia_anios : 1,
        seleccionada: !!existente
      };

      if (!agrupadas[catName]) {
        agrupadas[catName] = [];
      }
      agrupadas[catName].push(item);
    });

    this.habilidadesPorCategoria = agrupadas;
    this.categorias = Object.keys(agrupadas);
  }

  guardar(): void {
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const payload: GuardarHabilidadesRequest = {
      habilidades: []
    };

    Object.values(this.habilidadesPorCategoria).forEach(lista => {
      lista.filter(item => item.seleccionada).forEach(item => {
        payload.habilidades.push({
          habilidad_id: item.id,
          nivel: Number(item.nivel),
          experiencia_anios: item.experiencia_anios ? Number(item.experiencia_anios) : null
        });
      });
    });

    this.jugadoresService.guardarHabilidades(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = '¡Tus habilidades se han guardado con éxito!';
      },
      error: (err) => {
        console.error('Error al guardar habilidades:', err);
        this.guardando = false;
        this.mensajeError = 'Ocurrió un error al intentar guardar tus habilidades.';
      }
    });
  }
}