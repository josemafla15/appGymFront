import { Pipe, PipeTransform } from '@angular/core';
import { MuscleGroupLabels, MuscleGroup } from '@core/models';

@Pipe({
  name: 'muscleGroup'
})
export class MuscleGroupPipe implements PipeTransform {
  transform(value: MuscleGroup | string): string {
    if (!value) return '';
    return MuscleGroupLabels[value as MuscleGroup] || value;
  }
}