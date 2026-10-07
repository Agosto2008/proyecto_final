import { cazatalentosRepository } from './cazatalentos.repository.js';
import { GuardarCazatalentosInput } from './cazatalentos.schema.js';

export class CazatalentosService {
  async obtenerOcrearPropio(usuarioId: string) {
    let scout = await cazatalentosRepository.obtenerPorUsuarioId(usuarioId);
    if (!scout) {
      await cazatalentosRepository.crear(usuarioId);
      scout = await cazatalentosRepository.obtenerPorUsuarioId(usuarioId);
    }
    return scout;
  }

  async guardarPropio(usuarioId: string, input: GuardarCazatalentosInput) {
    const scout = await this.obtenerOcrearPropio(usuarioId);
    await cazatalentosRepository.actualizar(scout!.id, input);
    return await this.obtenerOcrearPropio(usuarioId);
  }
}

export const cazatalentosService = new CazatalentosService();