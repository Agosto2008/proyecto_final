import { Response } from 'express';
import { cazatalentosService } from './cazatalentos.service.js';

export class CazatalentosController {
  async me(req: any, res: Response) {
    const scout = await cazatalentosService.obtenerOcrearPropio(req.user.id);
    res.json({ data: scout });
  }

  async guardarMe(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const scout = await cazatalentosService.guardarPropio(req.user.id, datos);
    res.json({ data: scout });
  }
}

export const cazatalentosController = new CazatalentosController();