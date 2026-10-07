import { archivosRepository } from './archivos.repository.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js';
import { RegistrarArchivoInput, QueryArchivosEntidadInput } from './archivos.schema.js';

export class ArchivosService {
  async registrar(usuarioId: string, input: RegistrarArchivoInput) {
    const id = await archivosRepository.crear(usuarioId, input);
    return await archivosRepository.obtenerPorId(id);
  }

  async listarPorEntidad(entidadTipo: string, entidadId: string, query: QueryArchivosEntidadInput) {
    return await archivosRepository.listarPorEntidad(entidadTipo, entidadId, query.tipo_archivo);
  }

  async eliminar(id: string, usuarioId: string) {
    const archivo = await archivosRepository.obtenerPorId(id);
    if (!archivo) {
      throw new NotFoundError('Archivo no encontrado');
    }

    if (archivo.usuario_id !== usuarioId) {
      throw new ForbiddenError('No tienes permiso para eliminar este archivo');
    }

    await archivosRepository.eliminar(id);
    return { mensaje: 'Archivo eliminado con éxito' };
  }
}

export const archivosService = new ArchivosService();