import { Response } from 'express';
import { catalogosService } from './catalogos.service.js';

export class CatalogosController {
  async listarPaises(_req: any, res: Response) {
    const { busqueda } = res.locals.validated?.query || {};
    const paises = await catalogosService.listarPaises(busqueda);
    res.json({ data: paises });
  }

  async listarHabilidades(_req: any, res: Response) {
    const { categoria } = res.locals.validated?.query || {};
    const habilidades = await catalogosService.listarHabilidades(categoria);
    res.json({ data: habilidades });
  }
}

export const catalogosController = new CatalogosController();