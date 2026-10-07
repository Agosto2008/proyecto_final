import { Response } from 'express';
import { matchingService } from './matching.service.js';

export class MatchingController {
  async obtenerOportunidadesRecomendadas(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await matchingService.obtenerOportunidadesRecomendadas(req.user.id, query);
    res.json(resultado);
  }

  async obtenerJugadoresRecomendados(req: any, res: Response) {
    const { oportunidadId } = req.params;
    const query = res.locals.validated?.query;
    const resultado = await matchingService.obtenerJugadoresRecomendados(oportunidadId, query);
    res.json(resultado);
  }
}

export const matchingController = new MatchingController();