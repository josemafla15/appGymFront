import { Pipe, PipeTransform } from '@angular/core';
import { WorkoutDayTypeLabels, WorkoutDayType } from '@core/models';

@Pipe({
  name: 'workoutType'
})
export class WorkoutTypePipe implements PipeTransform {
  transform(value: WorkoutDayType | string): string {
    if (!value) return '';
    return WorkoutDayTypeLabels[value as WorkoutDayType] || value;
  }
}