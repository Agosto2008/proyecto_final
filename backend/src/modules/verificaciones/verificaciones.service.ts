import { verificacionesRepository } from './verificaciones.repository.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';
import { SolicitarVerificacionInput, CambiarEstadoVerificacionInput, QueryVerificacionesInput } from './verificaciones.schema.js';

export class VerificacionesService {
  async solicitarVerificacion(usuarioId: string, input: SolicitarVerificacionInput) {
    const pendiente = await verificacionesRepository.existeSolicitudPendiente(usuarioId, input.entidad_tipo, input.entidad_id);
    if (pendiente) {
      throw new ConflictError('Ya tienes una solicitud de verificación pendiente para este perfil');
    }

    const id = await verificacionesRepository.crearSolicitud(usuarioId, input);
    return { id, mensaje: 'Solicitud de verificación enviada con éxito' };
  }

  async listarMisSolicitudes(usuarioId: string) {
    return await verificacionesRepository.listarMisSolicitudes(usuarioId);
  }

  async listarTodas(query: QueryVerificacionesInput) {
    return await verificacionesRepository.listarTodas(query);
  }

  async cambiarEstado(id: string, adminId: string, input: CambiarEstadoVerificacionInput) {
    const solicitud = await verificacionesRepository.obtenerPorId(id);
    if (!solicitud) {
      throw new NotFoundError('Solicitud de verificación no encontrada');
    }

    if (solicitud.estado !== 'PENDIENTE') {
      throw new BadRequestError('Esta solicitud ya ha sido procesada previamente');
    }

    await verificacionesRepository.actualizarEstado(id, adminId, input.estado, input.motivo_rechazo);

    if (input.estado === 'APROBADO') {
      await verificacionesRepository.marcarPerfilComoVerificado(solicitud.entidad_tipo, solicitud.entidad_id);
    }

    return { mensaje: `Solicitud de verificación ${input.estado.toLowerCase()} con éxito` };
  }
}

export const verificacionesService = new VerificacionesService();