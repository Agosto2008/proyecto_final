import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then(
        (m) => m.Home,
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (m) => m.Login,
      ),
  },

  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro').then(
        (m) => m.Registro,
      ),
  },

  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./features/auth/recuperar/recuperar').then(
        (m) => m.Recuperar,
      ),
  },


  // ==========================
  // DASHBOARD JUGADOR
  // ==========================

 {
  path: 'jugador/perfil',
  canActivate: [
    authGuard,
    roleGuard,
  ],
  data: {
    roles: ['JUGADOR'],
  },
  loadComponent: () =>
    import('./features/jugador/perfil/perfil').then(
      (m) => m.Perfil,
    ),
},


  // ==========================
  // DASHBOARD CAZATALENTOS
  // ==========================

  {
    path: 'cazatalentos',
    canActivate: [
      authGuard,
      roleGuard,
    ],
    data: {
      roles: ['CAZATALENTOS'],
    },
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(
        (m) => m.Dashboard,
      ),
  },


  // ==========================
  // DASHBOARD ORGANIZACIÓN
  // ==========================

  {
    path: 'organizacion',
    canActivate: [
      authGuard,
      roleGuard,
    ],
    data: {
      roles: ['ORGANIZACION'],
    },
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(
        (m) => m.Dashboard,
      ),
  },


  // ==========================
  // DASHBOARD ADMIN
  // ==========================

  {
    path: 'admin',
    canActivate: [
      authGuard,
      roleGuard,
    ],
    data: {
      roles: ['ADMIN'],
    },
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(
        (m) => m.Dashboard,
      ),
  },


  {
    path: '**',
    redirectTo: '',
  },
];