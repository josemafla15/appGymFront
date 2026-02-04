import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, AdminGuard, GuestGuard } from './core/guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/user/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/user/user.module').then(m => m.UserModule)
  },
  {
    path: '**',
    redirectTo: '/user/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }