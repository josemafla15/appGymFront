import { ExerciseList } from './exercise.model';

export enum WorkoutDayType {
  LEG_DAY = 'LEG_DAY',
  UPPER_BODY_DAY = 'UPPER_BODY_DAY',
  PULL_DAY = 'PULL_DAY',
  PUSH_DAY = 'PUSH_DAY',
  FULL_BODY_DAY = 'FULL_BODY_DAY'
}

export const WorkoutDayTypeLabels: Record<WorkoutDayType, string> = {
  [WorkoutDayType.LEG_DAY]: 'Leg Day',
  [WorkoutDayType.UPPER_BODY_DAY]: 'Upper Body Day',
  [WorkoutDayType.PULL_DAY]: 'Pull Day',
  [WorkoutDayType.PUSH_DAY]: 'Push Day',
  [WorkoutDayType.FULL_BODY_DAY]: 'Full Body Day'
};

export interface WorkoutDayExercise {
  id: number;
  exercise: ExerciseList;
  exercise_id?: number;
  order: number;
  number_of_sets: number;
}

export interface WorkoutDayTemplate {
  id: number;
  type: WorkoutDayType;
  type_display: string;
  name: string;
  exercises: WorkoutDayExercise[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDayTemplateList {
  id: number;
  type: WorkoutDayType;
  type_display: string;
  name: string;
  exercise_count: number;
}

export interface WorkoutDayTemplateCreate {
  type: WorkoutDayType;
  name?: string;
}

export interface WorkoutDayExerciseCreate {
  exercise_id: number;
  order: number;
  number_of_sets: number;
}

export interface WorkoutWeekDay {
  id: number;
  workout_day: WorkoutDayTemplate;
  workout_day_id?: number;
  day_order: number;
}

export interface WorkoutWeekTemplate {
  id: number;
  name: string;
  description: string;
  days: WorkoutWeekDay[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutWeekTemplateList {
  id: number;
  name: string;
  description: string;
  day_count: number;
}

export interface WorkoutWeekTemplateCreate {
  name: string;
  description?: string;
}

export interface WorkoutWeekDayCreate {
  workout_day_id: number;
  day_order: number;
}