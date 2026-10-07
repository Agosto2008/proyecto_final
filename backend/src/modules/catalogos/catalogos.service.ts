import { catalogosRepository } from './catalogos.repository.js';

export class CatalogosService {
  async listarPaises(busqueda?: string) {
    return await catalogosRepository.obtenerPaises(busqueda);
  }

  async listarHabilidades(categoria?: string) {
    return await catalogosRepository.obtenerHabilidades(categoria);
  }
}

export const catalogosService = new CatalogosService();