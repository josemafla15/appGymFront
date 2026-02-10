import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseNoteDialogComponent } from './exercise-note-dialog.component';

describe('ExerciseNoteDialogComponent', () => {
  let component: ExerciseNoteDialogComponent;
  let fixture: ComponentFixture<ExerciseNoteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseNoteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseNoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
