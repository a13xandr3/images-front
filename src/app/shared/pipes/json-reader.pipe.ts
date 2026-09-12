import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'JSON',
  standalone: true,
})
export class JsonReaderPipe implements PipeTransform {
  transform(value: unknown): string {
    if (value === undefined) {
      return '';
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }
}
