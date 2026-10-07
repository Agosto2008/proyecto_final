import { usuariosRepository } from './usuarios.repository.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';
import { catalogosRepository } from '../catalogos/catalogos.repository.js';
import { 
  ActualizarPerfilInput, 
  QueryUsuariosInput, 
  CambiarEstadoUsuarioInput 
} from './usuarios.schema.js';

export class UsuariosService {
  async obtenerPerfil(usuarioId: string) {
    const usuario = await usuariosRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return usuario;
  }

  async actualizarPerfil(usuarioId: string, input: ActualizarPerfilInput) {
    if (input.pais_id) {
      const paises = await catalogosRepository.obtenerPaises();
      const paisExiste = paises.some(p => p.id === input.pais_id);
      if (!paisExiste) {
        throw new BadRequestError('El país especificado no existe o no está activo');
      }
    }

    const actualizado = await usuariosRepository.actualizarPerfil(usuarioId, input);
    if (!actualizado) {
      throw new NotFoundError('No se pudo actualizar el perfil');
    }

    return await this.obtenerPerfil(usuarioId);
  }

  async listarUsuarios(query: QueryUsuariosInput) {
    return await usuariosRepository.listarPaginado(query);
  }

  async obtenerDetalleAdmin(usuarioId: string) {
    const usuario = await usuariosRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return usuario;
  }

  async cambiarEstado(usuarioId: string, input: CambiarEstadoUsuarioInput) {
    const usuario = await usuariosRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    await usuariosRepository.cambiarEstado(usuarioId, input.estado);

    // Si se suspende o elimina, cerramos todas sus sesiones inmediatamente
    if (input.estado === 'SUSPENDIDO' || input.estado === 'ELIMINADO') {
      await usuariosRepository.revocarSesiones(usuarioId);
    }

    return await this.obtenerPerfil(usuarioId);
  }

  async asignarRol(usuarioId: string, rolId: number) {
    const usuario = await usuariosRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    await usuariosRepository.agregarRol(usuarioId, rolId);
    return await this.obtenerPerfil(usuarioId);
  }

  async removerRol(usuarioId: string, rolId: number) {
    const usuario = await usuariosRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    await usuariosRepository.removerRol(usuarioId, rolId);
    return await this.obtenerPerfil(usuarioId);
  }
}

export const usuariosService = new UsuariosService();