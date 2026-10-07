export interface HabilidadJugador {
  habilidad_id: number;
  nombre: string;
  categoria: string;
  nivel: number;
  experiencia_anios: number | null;
  evaluado: boolean;
}

export interface PerfilJugador {
  id: string;
  usuario_id: string;

  nombre_deportivo: string | null;
  posicion_principal: string | null;
  posicion_secundaria: string | null;
  categoria: string | null;

  altura_cm: number | null;
  peso_kg: number | null;

  pierna_dominante:
    | 'IZQUIERDA'
    | 'DERECHA'
    | 'AMBAS'
    | null;

  experiencia: string | null;
  descripcion: string | null;

  perfil_publico: boolean;
  estado_perfil: string;

  creado_en: string;
  actualizado_en: string;

  habilidades: HabilidadJugador[];
}

export interface JugadorMeResponse {
  data: PerfilJugador;
}