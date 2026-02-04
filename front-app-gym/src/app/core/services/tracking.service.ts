import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  WorkoutLog,
  WorkoutLogCreate,
  WorkoutLogList,
  SetLog,
  SetLogCreate,
  WorkoutStats
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly API_URL = `${environment.apiUrl}/tracking`;

  constructor(private http: HttpClient) {}

  getWorkoutLogs(filters?: {
    completed?: boolean;
    date?: string;
    ordering?: string;
  }): Observable<WorkoutLogList[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.completed !== undefined) {
        params = params.set('completed', filters.completed.toString());
      }
      if (filters.date) {
        params = params.set('date', filters.date);
      }
      if (filters.ordering) {
        params = params.set('ordering', filters.ordering);
      }
    }

    return this.http.get<WorkoutLogList[]>(`${this.API_URL}/workouts/`, { params });
  }

  getWorkoutLog(id: number): Observable<WorkoutLog> {
    return this.http.get<WorkoutLog>(`${this.API_URL}/workouts/${id}/`);
  }

  createWorkoutLog(workoutLog: WorkoutLogCreate): Observable<WorkoutLog> {
    return this.http.post<WorkoutLog>(`${this.API_URL}/workouts/`, workoutLog);
  }

  updateWorkoutLog(id: number, workoutLog: Partial<WorkoutLogCreate>): Observable<WorkoutLog> {
    return this.http.patch<WorkoutLog>(`${this.API_URL}/workouts/${id}/`, workoutLog);
  }

  deleteWorkoutLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/workouts/${id}/`);
  }

  addSetToWorkout(workoutLogId: number, setLog: SetLogCreate): Observable<SetLog> {
    return this.http.post<SetLog>(
      `${this.API_URL}/workouts/${workoutLogId}/add_set/`,
      setLog
    );
  }

  markWorkoutCompleted(workoutLogId: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/workouts/${workoutLogId}/mark_completed/`,
      {}
    );
  }

  getWorkoutHistory(startDate?: string, endDate?: string): Observable<WorkoutLogList[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<WorkoutLogList[]>(`${this.API_URL}/workouts/history/`, { params });
  }

  getWorkoutStats(): Observable<WorkoutStats> {
    return this.http.get<WorkoutStats>(`${this.API_URL}/workouts/stats/`);
  }

  getSetLogs(): Observable<SetLog[]> {
    return this.http.get<SetLog[]>(`${this.API_URL}/sets/`);
  }

  getSetLog(id: number): Observable<SetLog> {
    return this.http.get<SetLog>(`${this.API_URL}/sets/${id}/`);
  }

  updateSetLog(id: number, setLog: Partial<SetLogCreate>): Observable<SetLog> {
    return this.http.patch<SetLog>(`${this.API_URL}/sets/${id}/`, setLog);
  }

  deleteSetLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sets/${id}/`);
  }
}