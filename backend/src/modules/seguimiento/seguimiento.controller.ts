import { Response } from 'express';
import { seguimientoService } from './seguimiento.service.js';

export class SeguimientoController {
  async seguir(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const resultado = await seguimientoService.seguir(req.user.id, datos);
    res.status(201).json({ data: resultado });
  }

  async dejarDeSeguir(req: any, res: Response) {
    const { entidadTipo, entidadId } = req.params;
    const resultado = await seguimientoService.dejarDeSeguir(req.user.id, entidadTipo, entidadId);
    res.json(resultado);
  }

  async listarSiguiendo(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await seguimientoService.listarSiguiendo(req.user.id, query);
    res.json(resultado);
  }

  async obtenerSeguidores(req: any, res: Response) {
    const { entidadTipo, entidadId } = req.params;
    const resultado = await seguimientoService.obtenerSeguidores(entidadTipo, entidadId);
    res.json({ data: resultado });
  }
}

export const seguimientoController = new SeguimientoController();