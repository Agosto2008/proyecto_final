import { matchingRepository } from './matching.repository.js';
import { jugadoresRepository } from '../jugadores/jugadores.repository.js';
import { oportunidadesRepository } from '../oportunidades/oportunidades.repository.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js';
import { QueryMatchingInput } from './matching.schema.js';

export class MatchingService {
  async obtenerOportunidadesRecomendadas(usuarioId: string, query: QueryMatchingInput) {
    const jugador = await jugadoresRepository.obtenerPorUsuarioId(usuarioId);
    if (!jugador) {
      throw new ForbiddenError('El usuario no tiene perfil de jugador');
    }

    const oportunidades = await matchingRepository.obtenerOportunidadesParaJugador(jugador.id);
    
    // Filtrar por nivel mínimo de compatibilidad
    const filtrados = oportunidades.filter((op: any) => op.porcentaje_match >= query.compatibilidad_minima);

    return {
      data: filtrados,
      meta: {
        total: filtrados.length,
        compatibilidad_minima: query.compatibilidad_minima,
      },
    };
  }

  async obtenerJugadoresRecomendados(oportunidadId: string, query: QueryMatchingInput) {
    const oportunidad = await oportunidadesRepository.obtenerPorId(oportunidadId);
    if (!oportunidad) {
      throw new NotFoundError('Oportunidad no encontrada');
    }

    const jugadores = await matchingRepository.obtenerJugadoresParaOportunidad(oportunidadId);
    const filtrados = jugadores.filter((j: any) => j.porcentaje_match >= query.compatibilidad_minima);

    return {
      data: filtrados,
      meta: {
        total: filtrados.length,
        compatibilidad_minima: query.compatibilidad_minima,
      },
    };
  }
}

export const matchingService = new MatchingService();