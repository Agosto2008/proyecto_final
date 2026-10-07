import type { ListarAuditoriaInput } from './auditoria.schema.js';
// src/modules/sistema/auditoria.service.ts
import { listarAuditoria, registrarAuditoria as repoRegistrarAuditoria } from './auditoria.repository.js';

export async function registrarAuditoria(datos: any) {
  return await repoRegistrarAuditoria(datos);
}

export async function consultarAuditoria(
  adminId: string,
  ipHash: string | null,
  filtros: ListarAuditoriaInput,
) {
  const { filas, total } = await listarAuditoria({
    accion: filtros.accion,
    entidad: filtros.entidad,
    usuarioId: filtros.usuario_id,
    desde: filtros.desde,
    hasta: filtros.hasta,
    limite: filtros.limite,
    offset: (filtros.pagina - 1) * filtros.limite,
  });

  // Quien revisa la auditoría también deja huella
  await registrarAuditoria({
    usuarioId: adminId,
    accion: 'AUDITORIA_CONSULTADA',
    entidad: 'auditoria',
    ipHash,
    detalles: { filtros },
  });

  return {
    datos: filas,
    paginacion: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      totalPaginas: Math.ceil(total / filtros.limite),
    },
  };
}