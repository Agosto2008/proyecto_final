export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: Usuario;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface MeResponse {
  usuario: Usuario;
}