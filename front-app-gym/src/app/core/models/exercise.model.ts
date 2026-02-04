export enum MuscleGroup {
  QUADRICEPS = 'QUADRICEPS',
  HAMSTRINGS = 'HAMSTRINGS',
  GLUTES = 'GLUTES',
  CALVES = 'CALVES',
  LATS = 'LATS',
  TRAPS = 'TRAPS',
  LOWER_BACK = 'LOWER_BACK',
  CHEST = 'CHEST',
  FRONT_DELTS = 'FRONT_DELTS',
  SIDE_DELTS = 'SIDE_DELTS',
  REAR_DELTS = 'REAR_DELTS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  FOREARMS = 'FOREARMS',
  ABS = 'ABS',
  OBLIQUES = 'OBLIQUES'
}

export const MuscleGroupLabels: Record<MuscleGroup, string> = {
  [MuscleGroup.QUADRICEPS]: 'Quadriceps',
  [MuscleGroup.HAMSTRINGS]: 'Hamstrings',
  [MuscleGroup.GLUTES]: 'Glutes',
  [MuscleGroup.CALVES]: 'Calves',
  [MuscleGroup.LATS]: 'Lats',
  [MuscleGroup.TRAPS]: 'Traps',
  [MuscleGroup.LOWER_BACK]: 'Lower Back',
  [MuscleGroup.CHEST]: 'Chest',
  [MuscleGroup.FRONT_DELTS]: 'Front Deltoids',
  [MuscleGroup.SIDE_DELTS]: 'Side Deltoids',
  [MuscleGroup.REAR_DELTS]: 'Rear Deltoids',
  [MuscleGroup.BICEPS]: 'Biceps',
  [MuscleGroup.TRICEPS]: 'Triceps',
  [MuscleGroup.FOREARMS]: 'Forearms',
  [MuscleGroup.ABS]: 'Abs',
  [MuscleGroup.OBLIQUES]: 'Obliques'
};

export interface Exercise {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  muscle_group_display: string;
  image_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseCreate {
  name: string;
  muscle_group: MuscleGroup;
  image_url?: string;
  description?: string;
}

export interface ExerciseUpdate extends Partial<ExerciseCreate> {
  is_active?: boolean;
}

export interface ExerciseList {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  muscle_group_display: string;
  image_url: string;
}