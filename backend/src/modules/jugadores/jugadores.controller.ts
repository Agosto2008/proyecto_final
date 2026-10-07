import { Response } from 'express';
import { jugadoresService } from './jugadores.service.js';

export class JugadoresController {
  async me(req: any, res: Response) {
    const perfil = await jugadoresService.obtenerOcrearPerfilPropio(req.user.id);
    res.json({ data: perfil });
  }

  async guardarMe(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const perfil = await jugadoresService.guardarPerfilPropio(req.user.id, datos);
    res.json({ data: perfil });
  }

  async guardarHabilidadesMe(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const habilidades = await jugadoresService.guardarHabilidadesPropias(req.user.id, datos);
    res.json({ data: habilidades });
  }

  async listarPublicos(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await jugadoresService.listarPublicos(query);
    res.json(resultado);
  }

  async obtenerPorId(req: any, res: Response) {
    const { id } = req.params;
    const perfil = await jugadoresService.obtenerDetallePublico(id);
    res.json({ data: perfil });
  }

  async crearPropuesta(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const propuestas = await jugadoresService.crearPropuesta(req.user.id, datos);
    res.status(201).json({ data: propuestas });
  }

  async listarPropuestasMe(req: any, res: Response) {
    const propuestas = await jugadoresService.listarPropuestasPropias(req.user.id);
    res.json({ data: propuestas });
  }
}

export const jugadoresController = new JugadoresController();