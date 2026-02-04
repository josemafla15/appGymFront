import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  WorkoutDayTemplate,
  WorkoutDayTemplateList,
  WorkoutDayTemplateCreate,
  WorkoutDayExerciseCreate,
  WorkoutDayExercise,
  WorkoutDayType,
  WorkoutWeekTemplate,
  WorkoutWeekTemplateList,
  WorkoutWeekTemplateCreate,
  WorkoutWeekDayCreate
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly API_URL = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

  // ==================== Workout Day Templates ====================

  getWorkoutDays(filters?: {
    type?: WorkoutDayType;
    search?: string;
    ordering?: string;
  }): Observable<WorkoutDayTemplateList[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.ordering) {
        params = params.set('ordering', filters.ordering);
      }
    }

    return this.http.get<WorkoutDayTemplateList[]>(`${this.API_URL}/days/`, { params });
  }

  getWorkoutDay(id: number): Observable<WorkoutDayTemplate> {
    return this.http.get<WorkoutDayTemplate>(`${this.API_URL}/days/${id}/`);
  }

  createWorkoutDay(workoutDay: WorkoutDayTemplateCreate): Observable<WorkoutDayTemplate> {
    return this.http.post<WorkoutDayTemplate>(`${this.API_URL}/days/`, workoutDay);
  }

  updateWorkoutDay(id: number, workoutDay: Partial<WorkoutDayTemplateCreate>): Observable<WorkoutDayTemplate> {
    return this.http.patch<WorkoutDayTemplate>(`${this.API_URL}/days/${id}/`, workoutDay);
  }

  deleteWorkoutDay(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/days/${id}/`);
  }

  addExerciseToDay(workoutDayId: number, exercise: WorkoutDayExerciseCreate): Observable<WorkoutDayExercise> {
    return this.http.post<WorkoutDayExercise>(
      `${this.API_URL}/days/${workoutDayId}/add_exercise/`,
      exercise
    );
  }

  removeExerciseFromDay(workoutDayId: number, exerciseId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/days/${workoutDayId}/exercises/${exerciseId}/`
    );
  }

  // ==================== Workout Week Templates ====================

  getWorkoutWeeks(filters?: {
    search?: string;
    ordering?: string;
  }): Observable<WorkoutWeekTemplateList[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.ordering) {
        params = params.set('ordering', filters.ordering);
      }
    }

    return this.http.get<WorkoutWeekTemplateList[]>(`${this.API_URL}/weeks/`, { params });
  }

  getWorkoutWeek(id: number): Observable<WorkoutWeekTemplate> {
    return this.http.get<WorkoutWeekTemplate>(`${this.API_URL}/weeks/${id}/`);
  }

  createWorkoutWeek(workoutWeek: WorkoutWeekTemplateCreate): Observable<WorkoutWeekTemplate> {
    return this.http.post<WorkoutWeekTemplate>(`${this.API_URL}/weeks/`, workoutWeek);
  }

  updateWorkoutWeek(id: number, workoutWeek: Partial<WorkoutWeekTemplateCreate>): Observable<WorkoutWeekTemplate> {
    return this.http.patch<WorkoutWeekTemplate>(`${this.API_URL}/weeks/${id}/`, workoutWeek);
  }

  deleteWorkoutWeek(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/weeks/${id}/`);
  }

  addDayToWeek(workoutWeekId: number, day: WorkoutWeekDayCreate): Observable<any> {
    return this.http.post(
      `${this.API_URL}/weeks/${workoutWeekId}/add_day/`,
      day
    );
  }

  removeDayFromWeek(workoutWeekId: number, dayOrder: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/weeks/${workoutWeekId}/days/${dayOrder}/`
    );
  }
}