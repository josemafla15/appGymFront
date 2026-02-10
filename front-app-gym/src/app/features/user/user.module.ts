import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

// Components
import { UserLayout } from './components/user-layout/user-layout';
import { Navbar } from './components/navbar/navbar';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MyWorkoutsComponent } from './pages/my-workouts/my-workouts/my-workouts.component';
import { DoWorkoutComponent } from './pages/do-workout/do-workout/do-workout.component';

// Dialogs
import { ExerciseNoteDialogComponent } from './pages/do-workout/exercise-note-dialog/exercise-note-dialog/exercise-note-dialog.component';

@NgModule({
  declarations: [
    UserLayout,
    Navbar,
    DashboardComponent,
    MyWorkoutsComponent,
    DoWorkoutComponent,
    ExerciseNoteDialogComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }