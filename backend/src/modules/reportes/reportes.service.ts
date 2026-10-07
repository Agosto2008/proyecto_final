import { reportesRepository } from './reportes.repository.js';
import { organizacionesRepository } from '../organizaciones/organizaciones.repository.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

export class ReportesService {
  async obtenerDashboardAdmin() {
    return await reportesRepository.obtenerMétricasDashboard();
  }

  async obtenerResumenOrganizacion(usuarioId: string) {
    const organizacion = await organizacionesRepository.obtenerPorUsuarioId(usuarioId);
    if (!organizacion) {
      throw new NotFoundError('Perfil de organización no encontrado para este usuario');
    }

    return await reportesRepository.obtenerResumenOrganizacion(organizacion.id);
  }

  async obtenerDistribucionPosiciones() {
    return await reportesRepository.obtenerDistribucionPosiciones();
  }
}

export const reportesService = new ReportesService();