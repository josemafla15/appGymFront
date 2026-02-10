import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

// Layout Components
import { AdminLayout } from './components/admin-layout/admin-layout';
import { Sidebar } from './components/sidebar/sidebar';

// Dashboard
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

@NgModule({
  declarations: [
    // Layout
    AdminLayout,
    Sidebar,
    
    // Dashboard
    AdminDashboardComponent,
    
    // Exercises
    ExerciseListComponent,
    ExerciseFormComponent,
    
    // Workout Days
    WorkoutDayListComponent,
    WorkoutDayFormComponent,
    
    // Workout Weeks
    WorkoutWeekListComponent,
    WorkoutWeekFormComponent,
    
    // Users
    UserListComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }