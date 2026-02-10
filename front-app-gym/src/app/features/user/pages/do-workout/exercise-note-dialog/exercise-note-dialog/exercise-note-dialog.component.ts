import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ExerciseNoteDialogData {
  exerciseName: string;
  note: string;
}

@Component({
  selector: 'app-exercise-note-dialog',
  templateUrl: './exercise-note-dialog.component.html',
  styleUrls: ['./exercise-note-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseNoteDialogComponent {
  noteForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ExerciseNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExerciseNoteDialogData,
    private fb: FormBuilder
  ) {
    this.noteForm = this.fb.group({
      note: [data.note || '', Validators.maxLength(500)]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.noteForm.valid) {
      this.dialogRef.close(this.noteForm.get('note')?.value);
    }
  }
}