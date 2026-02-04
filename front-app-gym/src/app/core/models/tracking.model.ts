import { ExerciseList } from './exercise.model';
import { WorkoutDayTemplate } from './workout.model';

export interface SetLog {
  id: number;
  exercise: ExerciseList;
  exercise_id?: number;
  set_number: number;
  reps: number;
  weight?: number;
  created_at: string;
}

export interface SetLogCreate {
  exercise_id: number;
  set_number: number;
  reps: number;
  weight?: number;
}

export interface WorkoutLog {
  id: number;
  user: number;
  workout_day: WorkoutDayTemplate;
  workout_day_id?: number;
  date: string;
  completed: boolean;
  notes: string;
  set_logs: SetLog[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutLogCreate {
  workout_day_id: number;
  date: string;
  notes?: string;
}

export interface WorkoutLogList {
  id: number;
  workout_day_name: string;
  workout_day_type: string;
  date: string;
  completed: boolean;
  total_sets: number;
}

export interface WorkoutStats {
  total_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  total_sets: number;
}