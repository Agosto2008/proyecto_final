import { Response } from 'express';
import { verificacionesService } from './verificaciones.service.js';

export class VerificacionesController {
  async solicitarVerificacion(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const resultado = await verificacionesService.solicitarVerificacion(req.user.id, datos);
    res.status(201).json({ data: resultado });
  }

  async listarMisSolicitudes(req: any, res: Response) {
    const solicitudes = await verificacionesService.listarMisSolicitudes(req.user.id);
    res.json({ data: solicitudes });
  }

  async listarTodas(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await verificacionesService.listarTodas(query);
    res.json(resultado);
  }

  async cambiarEstado(req: any, res: Response) {
    const { id } = req.params;
    const datos = res.locals.validated?.body;
    const resultado = await verificacionesService.cambiarEstado(id, req.user.id, datos);
    res.json({ data: resultado });
  }
}

export const verificacionesController = new VerificacionesController();