export interface AuthUser {
  id: string;
  roles: string[];
}

// Le dice a TypeScript que, después de autenticar, req.user existe
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}