import { Response } from 'express';
import { oportunidadesService } from './oportunidades.service.js';

export class OportunidadesController {
  async crear(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const oportunidad = await oportunidadesService.crear(req.user.id, datos);
    res.status(201).json({ data: oportunidad });
  }

  async listar(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await oportunidadesService.listar(query);
    res.json(resultado);
  }

  async obtenerPorId(req: any, res: Response) {
    const { id } = req.params;
    const oportunidad = await oportunidadesService.obtenerPorId(id);
    res.json({ data: oportunidad });
  }

  async actualizar(req: any, res: Response) {
    const { id } = req.params;
    const datos = res.locals.validated?.body;
    const oportunidad = await oportunidadesService.actualizar(id, req.user.id, datos);
    res.json({ data: oportunidad });
  }

  async cerrar(req: any, res: Response) {
    const { id } = req.params;
    const oportunidad = await oportunidadesService.cerrar(id, req.user.id);
    res.json({ data: oportunidad, mensaje: 'Oportunidad cerrada exitosamente' });
  }
}

export const oportunidadesController = new OportunidadesController();