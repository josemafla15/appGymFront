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
import { RenewWeekDialogComponent } from './pages/renew-week-dialog/renew-week-dialog.component';

// Material Modules
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    UserLayout,
    Navbar,
    DashboardComponent,
    MyWorkoutsComponent,
    DoWorkoutComponent,
    ExerciseNoteDialogComponent,
    RenewWeekDialogComponent
  ],
  imports: [
    SharedModule,
    UserRoutingModule,
    MatCheckboxModule,
    MatProgressBarModule
  ]
})
export class UserModule { }