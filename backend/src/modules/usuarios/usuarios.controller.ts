import { Response } from 'express';
import { usuariosService } from './usuarios.service.js';

export class UsuariosController {
  async me(req: any, res: Response) {
    const usuario = await usuariosService.obtenerPerfil(req.user.id);
    res.json({ data: usuario });
  }

  async actualizarMe(req: any, res: Response) {
    const datos = res.locals.validated?.body;
    const usuarioActualizado = await usuariosService.actualizarPerfil(req.user.id, datos);
    res.json({ data: usuarioActualizado });
  }

  async listar(req: any, res: Response) {
    const query = res.locals.validated?.query;
    const resultado = await usuariosService.listarUsuarios(query);
    res.json(resultado);
  }

  async obtenerPorId(req: any, res: Response) {
    const { id } = req.params;
    const usuario = await usuariosService.obtenerDetalleAdmin(id);
    res.json({ data: usuario });
  }

  async cambiarEstado(req: any, res: Response) {
    const { id } = req.params;
    const datos = res.locals.validated?.body;
    const usuario = await usuariosService.cambiarEstado(id, datos);
    res.json({ data: usuario });
  }

  async asignarRol(req: any, res: Response) {
    const { id } = req.params;
    const { rol_id } = res.locals.validated?.body;
    const usuario = await usuariosService.asignarRol(id, rol_id);
    res.json({ data: usuario });
  }

  async removerRol(req: any, res: Response) {
    const { id, rolId } = req.params;
    const usuario = await usuariosService.removerRol(id, Number(rolId));
    res.json({ data: usuario });
  }
}

export const usuariosController = new UsuariosController();