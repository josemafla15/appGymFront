import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayout } from './components/user-layout/user-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MyWorkoutsComponent } from './pages/my-workouts/my-workouts/my-workouts.component';
import { DoWorkoutComponent } from './pages/do-workout/do-workout/do-workout.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'workouts', component: MyWorkoutsComponent },
      { path: 'workout/:id', component: DoWorkoutComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }