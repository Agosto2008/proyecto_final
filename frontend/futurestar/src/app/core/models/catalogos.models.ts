export interface Habilidad {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  activa: boolean;
}

export interface HabilidadesResponse {
  data: Habilidad[];
}

export interface Pais {
  id: number;
  nombre: string;
  codigo_iso: string;
  codigo_telefono: string | null;
  activo: boolean;
}

export interface PaisesResponse {
  data: Pais[];
}