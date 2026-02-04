import { WorkoutWeekTemplate, WorkoutDayTemplate } from './workout.model';

export interface UserWeekAssignment {
  id: number;
  user: number;
  week_template: WorkoutWeekTemplate;
  week_template_id?: number;
  start_date: string;
  is_active: boolean;
  created_at: string;
}

export interface UserWeekAssignmentCreate {
  week_template_id: number;
  start_date: string;
}

export interface UserCustomWorkoutDay {
  id: number;
  user: number;
  workout_day: WorkoutDayTemplate;
  workout_day_id?: number;
  day_order: number;
  is_active: boolean;
}

export interface UserCustomWorkoutDayCreate {
  workout_day_id: number;
  day_order: number;
}

export interface UserCustomExerciseConfig {
  id: number;
  user: number;
  workout_day_exercise: number;
  number_of_sets: number;
  is_active: boolean;
}

export interface UserCustomExerciseConfigCreate {
  workout_day_exercise: number;
  number_of_sets: number;
}