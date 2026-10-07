import { Response } from 'express';
import { archivosService } from './archivos.service.js';

export class ArchivosController {
  async registrar(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const archivo = await archivosService.registrar(req.user.id, datos);
    res.status(201).json({ data: archivo });
  }

  async listarPorEntidad(req: any, res: Response) {
    const { entidadTipo, entidadId } = req.params;
    const query = res.locals.validated?.query;
    const archivos = await archivosService.listarPorEntidad(entidadTipo.toUpperCase(), entidadId, query);
    res.json({ data: archivos });
  }

  async eliminar(req: any, res: Response) {
    const { id } = req.params;
    const resultado = await archivosService.eliminar(id, req.user.id);
    res.json(resultado);
  }
}

export const archivosController = new ArchivosController();