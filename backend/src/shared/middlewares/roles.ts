import type { NextFunction, Request, Response } from 'express';
import { registrarAuditoria } from '../../modules/sistema/auditoria.service.js';
import type { Rol } from '../constants/roles.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import { contextoDe } from '../utils/request-context.js';

/**
 * Permite el paso solo si el usuario tiene AL MENOS UNO de los roles indicados.
 * Debe ir después de authenticate:  router.get('/x', authenticate, requireRole('ADMIN'), ...)
 */
export function requireRole(...rolesPermitidos: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('No autenticado'));
      return;
    }

    const tienePermiso = req.user.roles.some((rol) => (rolesPermitidos as string[]).includes(rol));
    if (!tienePermiso) {
      // Un acceso denegado es un evento de seguridad: queda registrado
      void registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'ACCESO_DENEGADO',
        entidad: 'ruta',
        ipHash: contextoDe(req).ipHash,
        detalles: {
          metodo: req.method,
          ruta: req.originalUrl.split('?')[0],
          roles_requeridos: rolesPermitidos,
        },
      });
      next(new ForbiddenError());
      return;
    }

    next();
  };
}