import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  UserWeekAssignment,
  UserWeekAssignmentCreate,
  UserCustomWorkoutDay,
  UserCustomWorkoutDayCreate,
  UserCustomExerciseConfig,
  UserCustomExerciseConfigCreate
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly API_URL = `${environment.apiUrl}/assignments`;

  constructor(private http: HttpClient) {}

  getMyAssignment(): Observable<UserWeekAssignment> {
    return this.http.get<UserWeekAssignment>(`${this.API_URL}/my-assignment/`);
  }

  assignWeekToUser(userId: number, assignment: UserWeekAssignmentCreate): Observable<UserWeekAssignment> {
    return this.http.post<UserWeekAssignment>(
      `${this.API_URL}/users/${userId}/assign-week/`,
      assignment
    );
  }

  getMyCustomDays(): Observable<UserCustomWorkoutDay[]> {
    return this.http.get<UserCustomWorkoutDay[]>(`${this.API_URL}/my-custom-days/`);
  }

  addCustomDayToUser(userId: number, customDay: UserCustomWorkoutDayCreate): Observable<UserCustomWorkoutDay> {
    return this.http.post<UserCustomWorkoutDay>(
      `${this.API_URL}/users/${userId}/custom-days/`,
      customDay
    );
  }

  getMyCustomExercises(): Observable<UserCustomExerciseConfig[]> {
    return this.http.get<UserCustomExerciseConfig[]>(`${this.API_URL}/my-custom-exercises/`);
  }

  addCustomExerciseToUser(
    userId: number,
    customExercise: UserCustomExerciseConfigCreate
  ): Observable<UserCustomExerciseConfig> {
    return this.http.post<UserCustomExerciseConfig>(
      `${this.API_URL}/users/${userId}/custom-exercises/`,
      customExercise
    );
  }
}