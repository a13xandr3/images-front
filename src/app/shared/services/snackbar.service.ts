import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Snackbar,
  SnackbarType,
} from '../components/snackbar/snackbar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackbar = inject(MatSnackBar);

  show(message: string, type: SnackbarType = 'info', duration = 4000): void {
    this.snackbar.openFromComponent(Snackbar, {
      data: { message, type },
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`app-snackbar--${type}`],
      politeness: type === 'error' ? 'assertive' : 'polite',
    });
  }
}
