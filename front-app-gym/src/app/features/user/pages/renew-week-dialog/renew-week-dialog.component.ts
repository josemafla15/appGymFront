import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WeekInfo } from '@core/services/assignment.service';

export interface RenewWeekDialogData {
  currentWeek: WeekInfo;
  programName: string;
}

@Component({
  selector: 'app-renew-week-dialog',
  templateUrl: './renew-week-dialog.component.html',
  styleUrls: ['./renew-week-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenewWeekDialogComponent {
  renewForm: FormGroup;
  minDate: Date;

  constructor(
    public dialogRef: MatDialogRef<RenewWeekDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RenewWeekDialogData,
    private fb: FormBuilder
  ) {
    // Calcular fecha mínima (mañana)
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);

    // Calcular fecha por defecto (siguiente lunes o mañana si hoy es domingo)
    const defaultDate = this.getNextMonday();

    this.renewForm = this.fb.group({
      startDate: [defaultDate, Validators.required],
      useAutoDate: [true]
    });

    // Si selecciona auto, calcular automáticamente
    this.renewForm.get('useAutoDate')?.valueChanges.subscribe(useAuto => {
      if (useAuto) {
        this.renewForm.patchValue({ startDate: this.getNextMonday() });
      }
    });
  }

  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.renewForm.valid) {
      const startDate = this.renewForm.get('startDate')?.value;
      // Convertir a formato YYYY-MM-DD
      const formattedDate = this.formatDate(startDate);
      this.dialogRef.close({ startDate: formattedDate });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFormattedCurrentWeek(): string {
    const start = new Date(this.data.currentWeek.start_date);
    const end = new Date(this.data.currentWeek.end_date);
    return `${this.formatDateDisplay(start)} - ${this.formatDateDisplay(end)}`;
  }

  private formatDateDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}