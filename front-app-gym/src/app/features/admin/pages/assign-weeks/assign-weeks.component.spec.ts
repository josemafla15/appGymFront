import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignWeeksComponent } from './assign-weeks.component';

describe('AssignWeeksComponent', () => {
  let component: AssignWeeksComponent;
  let fixture: ComponentFixture<AssignWeeksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignWeeksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignWeeksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
