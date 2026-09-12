import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarData {
  message: string;
  type: SnackbarType;
}

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
})
export class Snackbar {
  protected readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
  private readonly snackbarRef = inject(MatSnackBarRef<Snackbar>);

  protected close(): void {
    this.snackbarRef.dismiss();
  }
}
