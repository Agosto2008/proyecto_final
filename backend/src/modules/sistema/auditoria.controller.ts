import type { Request, Response } from 'express';
import { contextoDe } from '../../shared/utils/request-context.js';
import type { ListarAuditoriaInput } from './auditoria.schema.js';
import * as service from './auditoria.service.js';

export async function listar(req: Request, res: Response): Promise<void> {
  const filtros = res.locals.validated.query as ListarAuditoriaInput;
  const resultado = await service.consultarAuditoria(req.user!.id, contextoDe(req).ipHash, filtros);
  res.json(resultado);
}