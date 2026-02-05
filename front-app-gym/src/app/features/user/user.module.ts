import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

// Components
import { UserLayout } from './components/user-layout/user-layout';
import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './pages/dashboard/dashboard';

@NgModule({
  declarations: [
    UserLayout,
    Navbar,
    Dashboard
  ],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }