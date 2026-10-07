import { comunicacionRepository } from './comunicacion.repository.js';
import { usuariosRepository } from '../usuarios/usuarios.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/app-error.js';
import { CrearConversacionInput, EnviarMensajeInput, QueryMensajesInput } from './comunicacion.schema.js';

export class ComunicacionService {
  async obtenerOCrearConversacion(emisorId: string, input: CrearConversacionInput) {
    if (emisorId === input.receptor_id) {
      throw new BadRequestError('No puedes iniciar una conversación contigo mismo');
    }

    const receptor = await usuariosRepository.obtenerPorId(input.receptor_id);
    if (!receptor) {
      throw new NotFoundError('El usuario receptor no existe');
    }

    let conversacion = await comunicacionRepository.buscarConversacionEntreUsuarios(emisorId, input.receptor_id);

    if (!conversacion) {
      const convId = await comunicacionRepository.crearConversacion(emisorId, input.receptor_id);
      conversacion = await comunicacionRepository.obtenerConversacionPorId(convId);
    }

    if (input.mensaje_inicial && conversacion) {
      await comunicacionRepository.crearMensaje(conversacion.id, emisorId, input.mensaje_inicial);
    }

    return conversacion;
  }

  async listarConversaciones(usuarioId: string) {
    return await comunicacionRepository.listarConversacionesPorUsuario(usuarioId);
  }

  async enviarMensaje(emisorId: string, input: EnviarMensajeInput) {
    const conversacion = await comunicacionRepository.obtenerConversacionPorId(input.conversacion_id);
    if (!conversacion) {
      throw new NotFoundError('Conversación no encontrada');
    }

    if (conversacion.usuario_1_id !== emisorId && conversacion.usuario_2_id !== emisorId) {
      throw new ForbiddenError('No perteneces a esta conversación');
    }

    const mensajeId = await comunicacionRepository.crearMensaje(input.conversacion_id, emisorId, input.contenido);
    return { id: mensajeId, conversacion_id: input.conversacion_id, emisor_id: emisorId, contenido: input.contenido };
  }

  async listarMensajes(conversacionId: string, usuarioId: string, query: QueryMensajesInput) {
    const conversacion = await comunicacionRepository.obtenerConversacionPorId(conversacionId);
    if (!conversacion) {
      throw new NotFoundError('Conversación no encontrada');
    }

    if (conversacion.usuario_1_id !== usuarioId && conversacion.usuario_2_id !== usuarioId) {
      throw new ForbiddenError('No perteneces a esta conversación');
    }

    return await comunicacionRepository.listarMensajes(conversacionId, query);
  }

  async marcarComoLeidos(conversacionId: string, usuarioId: string) {
    const conversacion = await comunicacionRepository.obtenerConversacionPorId(conversacionId);
    if (!conversacion) {
      throw new NotFoundError('Conversación no encontrada');
    }

    if (conversacion.usuario_1_id !== usuarioId && conversacion.usuario_2_id !== usuarioId) {
      throw new ForbiddenError('No perteneces a esta conversación');
    }

    await comunicacionRepository.marcarComoLeidos(conversacionId, usuarioId);
    return { mensaje: 'Mensajes marcados como leídos' };
  }
}

export const comunicacionService = new ComunicacionService();