import { oportunidadesRepository } from './oportunidades.repository.js';
import { organizacionesRepository } from '../organizaciones/organizaciones.repository.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js';
import { 
  CrearOportunidadInput, 
  ActualizarOportunidadInput, 
  QueryOportunidadesInput 
} from './oportunidades.schema.js';

export class OportunidadesService {
  async crear(usuarioId: string, input: CrearOportunidadInput) {
    const organizacion = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    if (!organizacion) {
      throw new ForbiddenError('El usuario autenticado no tiene un perfil de organización activo');
    }

    const id = await oportunidadesRepository.crear(organizacion.id, input);
    return await oportunidadesRepository.obtenerPorId(id);
  }

  async obtenerPorId(id: string) {
    const oportunidad = await oportunidadesRepository.obtenerPorId(id);
    if (!oportunidad) {
      throw new NotFoundError('Oportunidad no encontrada');
    }
    return oportunidad;
  }

  async actualizar(id: string, usuarioId: string, input: ActualizarOportunidadInput) {
    const oportunidad = await this.obtenerPorId(id);
    const organizacion = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);

    if (!organizacion || oportunidad.organizacion_id !== organizacion.id) {
      throw new ForbiddenError('No tienes permiso para actualizar esta oportunidad');
    }

    await oportunidadesRepository.actualizar(id, input);
    return await oportunidadesRepository.obtenerPorId(id);
  }

  async cerrar(id: string, usuarioId: string) {
    return await this.actualizar(id, usuarioId, { estado: 'CERRADA' });
  }

  async listar(query: QueryOportunidadesInput) {
    return await oportunidadesRepository.listar(query);
  }
}

export const oportunidadesService = new OportunidadesService();