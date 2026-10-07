import { organizacionesRepository } from './organizaciones.repository.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { GuardarOrganizacionInput, QueryOrganizacionesInput } from './organizaciones.schema.js';

export class OrganizacionesService {
  async obtenerOcrearPropia(usuarioId: string) {
    let org = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    if (!org) {
      await organizacionesRepository.crear(usuarioId);
      org = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    }
    return org;
  }

  async guardarPropia(usuarioId: string, input: GuardarOrganizacionInput) {
    const org = await this.obtenerOcrearPropia(usuarioId);
    await organizacionesRepository.actualizar(org!.id, input);
    return await this.obtenerOcrearPropia(usuarioId);
  }

  async listarPublicas(query: QueryOrganizacionesInput) {
    return await organizacionesRepository.listarPublicas(query);
  }

  async obtenerPorId(id: string) {
    const org = await organizacionesRepository.obtenerPorId(id);
    if (!org) {
      throw new NotFoundError('Organización no encontrada');
    }
    return org;
  }
}

export const organizacionesService = new OrganizacionesService();