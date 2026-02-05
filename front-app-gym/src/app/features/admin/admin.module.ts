import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

// Components
import { AdminLayout } from './components/admin-layout/admin-layout';
import { Sidebar } from './components/sidebar/sidebar';

// Pages
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { ExerciseListComponent } from './pages/exercises/exercise-list/exercise-list.component';
import { ExerciseFormComponent } from './pages/exercises/exercise-form/exercise-form.component';

@NgModule({
  declarations: [
    AdminLayout,
    Sidebar,
    AdminDashboardComponent,
    ExerciseListComponent,
    ExerciseFormComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }