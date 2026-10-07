import { Response } from 'express';
import { comunicacionService } from './comunicacion.service.js';

export class ComunicacionController {
  async obtenerOCrearConversacion(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const conversacion = await comunicacionService.obtenerOCrearConversacion(req.user.id, datos);
    res.status(201).json({ data: conversacion });
  }

  async listarConversaciones(req: any, res: Response) {
    const conversaciones = await comunicacionService.listarConversaciones(req.user.id);
    res.json({ data: conversaciones });
  }

  async enviarMensaje(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const mensaje = await comunicacionService.enviarMensaje(req.user.id, datos);
    res.status(201).json({ data: mensaje });
  }

  async listarMensajes(req: any, res: Response) {
    const { id } = req.params;
    const query = res.locals.validated?.query;
    const resultado = await comunicacionService.listarMensajes(id, req.user.id, query);
    res.json(resultado);
  }

  async marcarComoLeidos(req: any, res: Response) {
    const { id } = req.params;
    const resultado = await comunicacionService.marcarComoLeidos(id, req.user.id);
    res.json(resultado);
  }
}

export const comunicacionController = new ComunicacionController();