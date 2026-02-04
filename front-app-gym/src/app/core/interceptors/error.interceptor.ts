import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = this.getServerErrorMessage(error);
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          error: error.error
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    if (error.error) {
      if (typeof error.error === 'object') {
        const fieldErrors = Object.entries(error.error)
          .filter(([key]) => key !== 'detail')
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          });

        if (fieldErrors.length > 0) {
          return fieldErrors.join('; ');
        }

        if (error.error.detail) {
          return error.error.detail;
        }

        if (error.error.message) {
          return error.error.message;
        }
      }

      if (typeof error.error === 'string') {
        return error.error;
      }
    }

    switch (error.status) {
      case 400:
        return 'Bad Request: Please check your input';
      case 401:
        return 'Unauthorized: Please login again';
      case 403:
        return 'Forbidden: You do not have permission to access this resource';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 500:
        return 'Internal Server Error: Please try again later';
      case 503:
        return 'Service Unavailable: Please try again later';
      default:
        return error.statusText || 'An error occurred';
    }
  }
}