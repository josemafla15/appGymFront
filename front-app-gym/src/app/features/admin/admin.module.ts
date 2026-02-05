import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

// Components
import { AdminLayout } from './components/admin-layout/admin-layout';
import { Sidebar } from './components/sidebar/sidebar';

@NgModule({
  declarations: [
    AdminLayout,
    Sidebar
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }