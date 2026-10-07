import type { Request, Response } from 'express';

import { reportesService } from './reportes.service.js';

export class ReportesController {

  /**
   * Obtiene las métricas generales del sistema.
   */
  async obtenerDashboardAdmin(
    _req: Request,
    res: Response
  ): Promise<void> {
    const data = await reportesService.obtenerDashboardAdmin();

    res.json({
      data,
    });
  }

  /**
   * Obtiene el resumen analítico de la organización
   * del usuario autenticado.
   */
  async obtenerResumenOrganizacion(
    req: Request,
    res: Response
  ): Promise<void> {
    const data = await reportesService.obtenerResumenOrganizacion(
      req.user.id
    );

    res.json({
      data,
    });
  }

  /**
   * Obtiene la distribución de posiciones
   * de los jugadores.
   */
  async obtenerDistribucionPosiciones(
    _req: Request,
    res: Response
  ): Promise<void> {
    const data =
      await reportesService.obtenerDistribucionPosiciones();

    res.json({
      data,
    });
  }
}

export const reportesController = new ReportesController();

