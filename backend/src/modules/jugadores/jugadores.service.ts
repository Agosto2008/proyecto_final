import { jugadoresRepository } from './jugadores.repository.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js';
import { 
  GuardarPerfilJugadorInput, 
  ActualizarHabilidadesInput, 
  CrearPropuestaInput, 
  QueryJugadoresPublicosInput 
} from './jugadores.schema.js';

export class JugadoresService {
  async obtenerOcrearPerfilPropio(usuarioId: string) {
    let jugador = await jugadoresRepository.obtenerPorUsuarioId(usuarioId);
    if (!jugador) {
      await jugadoresRepository.crear(usuarioId);
      jugador = await jugadoresRepository.obtenerPorUsuarioId(usuarioId);
    }
    const habilidades = await jugadoresRepository.obtenerHabilidades(jugador!.id);
    return { ...jugador, habilidades };
  }

  

  async guardarPerfilPropio(usuarioId: string, input: GuardarPerfilJugadorInput) {
    const jugador = await this.obtenerOcrearPerfilPropio(usuarioId);
    await jugadoresRepository.actualizar(jugador.id, input);
    return await this.obtenerOcrearPerfilPropio(usuarioId);
  }

  async guardarHabilidadesPropias(usuarioId: string, input: ActualizarHabilidadesInput) {
    const jugador = await this.obtenerOcrearPerfilPropio(usuarioId);
    await jugadoresRepository.guardarHabilidades(jugador.id, input.habilidades);
    return await jugadoresRepository.obtenerHabilidades(jugador.id);
  }

  async listarPublicos(query: QueryJugadoresPublicosInput) {
    return await jugadoresRepository.listarPublicos(query);
  }

  async obtenerDetallePublico(jugadorId: string) {
    const jugador = await jugadoresRepository.obtenerPorId(jugadorId);
    if (!jugador || (!jugador.perfil_publico && jugador.estado_perfil !== 'ACTIVO')) {
      throw new NotFoundError('Perfil de jugador no encontrado o no es público');
    }
    const habilidades = await jugadoresRepository.obtenerHabilidades(jugador.id);
    return { ...jugador, habilidades };
  }

  async crearPropuesta(usuarioId: string, input: CrearPropuestaInput) {
    const jugador = await this.obtenerOcrearPerfilPropio(usuarioId);
    await jugadoresRepository.crearPropuesta(jugador.id, input);
    return await jugadoresRepository.listarPropuestas(jugador.id);
  }

  async listarPropuestasPropias(usuarioId: string) {
    const jugador = await this.obtenerOcrearPerfilPropio(usuarioId);
    return await jugadoresRepository.listarPropuestas(jugador.id);
  }
}

export const jugadoresService = new JugadoresService();