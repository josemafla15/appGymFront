import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  template: `
    <div class="back-button-container">
      <button mat-icon-button (click)="goBack()" [matTooltip]="backTooltip">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <button 
        *ngIf="showHome" 
        mat-icon-button 
        (click)="goHome()" 
        [matTooltip]="homeTooltip">
        <mat-icon>home</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .back-button-container {
      display: flex;
      gap: 0.5rem;

      button {
        mat-icon {
          color: #1976d2;
        }

        &:hover {
          background-color: rgba(25, 118, 210, 0.1);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackButtonComponent {
  @Input() showHome: boolean = true;
  @Input() homeRoute: string = '/user/dashboard';
  @Input() backTooltip: string = 'Go back';
  @Input() homeTooltip: string = 'Go to dashboard';

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate([this.homeRoute]);
  }
}