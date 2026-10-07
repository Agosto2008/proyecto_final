import { Response } from 'express';
import { organizacionesService } from './organizaciones.service.js';

export class OrganizacionesController {
  async me(req: any, res: Response) {
    const org = await organizacionesService.obtenerOcrearPropia(req.user.id);
    res.json({ data: org });
  }

  async guardarMe(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const org = await organizacionesService.guardarPropia(req.user.id, datos);
    res.json({ data: org });
  }

  async listarPublicas(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await organizacionesService.listarPublicas(query);
    res.json(resultado);
  }

  async obtenerPorId(req: any, res: Response) {
    const { id } = req.params;
    const org = await organizacionesService.obtenerPorId(id);
    res.json({ data: org });
  }
}

export const organizacionesController = new OrganizacionesController();