import { Response } from 'express';
import { evaluacionesService } from './evaluaciones.service.ts';

export class EvaluacionesController {
  async crear(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const evaluacion = await evaluacionesService.crearEvaluacion(req.user.id, datos);
    res.status(201).json({ data: evaluacion });
  }

  async obtenerPorId(req: any, res: Response) {
    const { id } = req.params;
    const evaluacion = await evaluacionesService.obtenerPorId(id);
    res.json({ data: evaluacion });
  }

  async listarPorJugador(req: any, res: Response) {
    const { jugadorId } = req.params;
    const query = res.locals.validated?.query;
    const resultado = await evaluacionesService.listarPorJugador(jugadorId, query);
    res.json(resultado);
  }

  async misEvaluaciones(req: any, res: Response) {
    const evaluaciones = await evaluacionesService.listarMisEvaluaciones(req.user.id);
    res.json({ data: evaluaciones });
  }
}

export const evaluacionesController = new EvaluacionesController();