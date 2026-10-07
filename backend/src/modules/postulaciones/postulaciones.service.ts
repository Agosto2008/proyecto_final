import { postulacionesRepository } from './postulaciones.repository.js';
import { jugadoresRepository } from '../jugadores/jugadores.repository.js';
import { oportunidadesRepository } from '../oportunidades/oportunidades.repository.js';
import { organizacionesRepository } from '../organizaciones/organizaciones.repository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/app-error.js';
import { 
  CrearPostulacionInput, 
  CambiarEstadoPostulacionInput, 
  QueryPostulacionesInput 
} from './postulaciones.schema.js';

export class PostulacionesService {
  async crear(usuarioId: string, input: CrearPostulacionInput) {
    const jugador = await jugadoresRepository.obtenerPorUsuarioId(usuarioId);
    if (!jugador) {
      throw new ForbiddenError('El usuario autenticado debe ser un jugador para postularse');
    }

    const oportunidad = await oportunidadesRepository.obtenerPorId(input.oportunidad_id);
    if (!oportunidad || oportunidad.estado !== 'ABIERTA') {
      throw new NotFoundError('La oportunidad no existe o ya no está abierta');
    }

    const yaExiste = await postulacionesRepository.existePostulacion(jugador.id, input.oportunidad_id);
    if (yaExiste) {
      throw new ConflictError('Ya te has postulado previamente a esta oportunidad');
    }

    const id = await postulacionesRepository.crear(jugador.id, input);
    return await postulacionesRepository.obtenerPorId(id);
  }

  async listarMisPostulaciones(usuarioId: string, query: QueryPostulacionesInput) {
    const jugador = await jugadoresRepository.obtenerPorUsuarioId(usuarioId);
    if (!jugador) {
      throw new ForbiddenError('El usuario autenticado no tiene perfil de jugador');
    }

    return await postulacionesRepository.listarPorJugador(jugador.id, query);
  }

  async listarPorOportunidad(oportunidadId: string, usuarioId: string, query: QueryPostulacionesInput) {
    const oportunidad = await oportunidadesRepository.obtenerPorId(oportunidadId);
    if (!oportunidad) {
      throw new NotFoundError('Oportunidad no encontrada');
    }

    const organizacion = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    if (!organizacion || oportunidad.organizacion_id !== organizacion.id) {
      throw new ForbiddenError('No tienes permisos para ver las postulaciones de esta oportunidad');
    }

    return await postulacionesRepository.listarPorOportunidad(oportunidadId, query);
  }

  async cambiarEstado(id: string, usuarioId: string, input: CambiarEstadoPostulacionInput) {
    const postulacion = await postulacionesRepository.obtenerPorId(id);
    if (!postulacion) {
      throw new NotFoundError('Postulación no encontrada');
    }

    const organizacion = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    if (!organizacion || (postulacion as any).organizacion_id !== organizacion.id) {
      throw new ForbiddenError('No tienes permisos para modificar el estado de esta postulación');
    }

    await postulacionesRepository.cambiarEstado(id, input.estado, input.notas_organizacion);
    return await postulacionesRepository.obtenerPorId(id);
  }
}

export const postulacionesService = new PostulacionesService();