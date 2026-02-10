import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';

// Exercises
import { ExerciseListComponent } from './pages/exercises/exercise-list/exercise-list.component';
import { ExerciseFormComponent } from './pages/exercises/exercise-form/exercise-form.component';

// Workout Days
import { WorkoutDayListComponent } from './pages/workout-days/workout-day-list/workout-day-list.component';
import { WorkoutDayFormComponent } from './pages/workout-days/workout-day-form/workout-day-form.component';

// Workout Weeks
import { WorkoutWeekListComponent } from './pages/workout-weeks/workout-week-list/workout-week-list.component';
import { WorkoutWeekFormComponent } from './pages/workout-weeks/workout-week-form/workout-week-form.component';

// Users
import { UserListComponent } from './pages/users/user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // Dashboard
      { path: 'dashboard', component: AdminDashboardComponent },
      
      // Exercises
      { path: 'exercises', component: ExerciseListComponent },
      { path: 'exercises/new', component: ExerciseFormComponent },
      { path: 'exercises/edit/:id', component: ExerciseFormComponent },
      
      // Workout Days
      { path: 'workout-days', component: WorkoutDayListComponent },
      { path: 'workout-days/new', component: WorkoutDayFormComponent },
      { path: 'workout-days/edit/:id', component: WorkoutDayFormComponent },
      
      // Workout Weeks
      { path: 'workout-weeks', component: WorkoutWeekListComponent },
      { path: 'workout-weeks/new', component: WorkoutWeekFormComponent },
      { path: 'workout-weeks/edit/:id', component: WorkoutWeekFormComponent },
      
      // Users
      { path: 'users', component: UserListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }