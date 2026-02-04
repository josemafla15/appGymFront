import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Exercise,
  ExerciseList,
  ExerciseCreate,
  ExerciseUpdate,
  MuscleGroup
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private readonly API_URL = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) {}

  getExercises(filters?: {
    muscle_group?: MuscleGroup;
    search?: string;
    ordering?: string;
  }): Observable<ExerciseList[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.muscle_group) {
        params = params.set('muscle_group', filters.muscle_group);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.ordering) {
        params = params.set('ordering', filters.ordering);
      }
    }

    return this.http.get<ExerciseList[]>(`${this.API_URL}/`, { params });
  }

  getExercise(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.API_URL}/${id}/`);
  }

  createExercise(exercise: ExerciseCreate): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.API_URL}/`, exercise);
  }

  updateExercise(id: number, exercise: ExerciseUpdate): Observable<Exercise> {
    return this.http.patch<Exercise>(`${this.API_URL}/${id}/`, exercise);
  }

  deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/`);
  }

  getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Observable<ExerciseList[]> {
    return this.getExercises({ muscle_group: muscleGroup });
  }

  searchExercises(query: string): Observable<ExerciseList[]> {
    return this.getExercises({ search: query });
  }
}