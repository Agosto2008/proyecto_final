import { seguimientoRepository } from './seguimiento.repository.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { SeguirEntidadInput, QuerySeguimientoInput } from './seguimiento.schema.js';

export class SeguimientoService {
  async seguir(usuarioId: string, input: SeguirEntidadInput) {
    const existe = await seguimientoRepository.existeSeguimiento(usuarioId, input.entidad_tipo, input.entidad_id);
    if (existe) {
      throw new ConflictError('Ya estás siguiendo a esta entidad');
    }

    const id = await seguimientoRepository.seguir(usuarioId, input);
    return { id, mensaje: 'Entidad seguida con éxito' };
  }

  async dejarDeSeguir(usuarioId: string, entidadTipo: string, entidadId: string) {
    const eliminado = await seguimientoRepository.dejarDeSeguir(usuarioId, entidadTipo.toUpperCase(), entidadId);
    if (!eliminado) {
      throw new NotFoundError('No se encontró el registro de seguimiento');
    }
    return { mensaje: 'Has dejado de seguir a esta entidad' };
  }

  async listarSiguiendo(usuarioId: string, query: QuerySeguimientoInput) {
    return await seguimientoRepository.listarSiguiendo(usuarioId, query);
  }

  async obtenerSeguidores(entidadTipo: string, entidadId: string) {
    const total = await seguimientoRepository.contarSeguidores(entidadTipo.toUpperCase(), entidadId);
    return { entidad_tipo: entidadTipo.toUpperCase(), entidad_id: entidadId, total_seguidores: total };
  }
}

export const seguimientoService = new SeguimientoService();