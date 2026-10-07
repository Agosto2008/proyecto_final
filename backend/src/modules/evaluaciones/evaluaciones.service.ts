import { evaluacionesRepository } from './evaluaciones.repository.js';
import { jugadoresRepository } from '../jugadores/jugadores.repository.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { CrearEvaluacionInput, QueryEvaluacionesJugadorInput } from './evaluaciones.schema.js';

export class EvaluacionesService {
  async crearEvaluacion(evaluadorId: string, input: CrearEvaluacionInput) {
    const jugador = await jugadoresRepository.obtenerPorId(input.jugador_id);
    if (!jugador) {
      throw new NotFoundError('Jugador no encontrado');
    }

    const evaluacionId = await evaluacionesRepository.crear(evaluadorId, input);
    return await evaluacionesRepository.obtenerPorId(evaluacionId);
  }

  async obtenerPorId(id: string) {
    const evaluacion = await evaluacionesRepository.obtenerPorId(id);
    if (!evaluacion) {
      throw new NotFoundError('Evaluación no encontrada');
    }
    return evaluacion;
  }

  async listarPorJugador(jugadorId: string, query: QueryEvaluacionesJugadorInput) {
    const jugador = await jugadoresRepository.obtenerPorId(jugadorId);
    if (!jugador) {
      throw new NotFoundError('Jugador no encontrado');
    }
    return await evaluacionesRepository.listarPorJugador(jugadorId, query);
  }

  async listarMisEvaluaciones(evaluadorId: string) {
    return await evaluacionesRepository.listarMisEvaluaciones(evaluadorId);
  }
}

export const evaluacionesService = new EvaluacionesService();