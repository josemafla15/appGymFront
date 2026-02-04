import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styleUrls: ['./alert.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[this.type];
  }
}