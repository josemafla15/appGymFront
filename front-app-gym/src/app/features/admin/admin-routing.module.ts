import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { ExerciseListComponent } from './pages/exercises/exercise-list/exercise-list.component';
import { ExerciseFormComponent } from './pages/exercises/exercise-form/exercise-form.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'exercises', component: ExerciseListComponent },
      { path: 'exercises/new', component: ExerciseFormComponent },
      { path: 'exercises/edit/:id', component: ExerciseFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }