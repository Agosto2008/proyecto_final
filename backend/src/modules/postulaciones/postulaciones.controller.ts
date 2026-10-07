import { Response } from 'express';
import { postulacionesService } from './postulaciones.service.js';

export class PostulacionesController {
  async crear(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const postulacion = await postulacionesService.crear(req.user.id, datos);
    res.status(201).json({ data: postulacion });
  }

  async listarMisPostulaciones(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await postulacionesService.listarMisPostulaciones(req.user.id, query);
    res.json(resultado);
  }

  async listarPorOportunidad(req: any, res: Response) {
    const { oportunidadId } = req.params;
    const query = res.locals.validated?.query;
    const resultado = await postulacionesService.listarPorOportunidad(oportunidadId, req.user.id, query);
    res.json(resultado);
  }

  async cambiarEstado(req: any, res: Response) {
    const { id } = req.params;
    const datos = res.locals.validated?.body;
    const postulacion = await postulacionesService.cambiarEstado(id, req.user.id, datos);
    res.json({ data: postulacion });
  }
}

export const postulacionesController = new PostulacionesController();