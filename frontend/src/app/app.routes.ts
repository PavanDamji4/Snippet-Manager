import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'snippets',
    loadComponent: () => import('./components/snippets/snippet-list/snippet-list.component').then(m => m.SnippetListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'snippets/new',
    loadComponent: () => import('./components/snippets/snippet-form/snippet-form.component').then(m => m.SnippetFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'snippets/edit/:id',
    loadComponent: () => import('./components/snippets/snippet-form/snippet-form.component').then(m => m.SnippetFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];