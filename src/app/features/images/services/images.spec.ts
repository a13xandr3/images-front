import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Images } from './images';

describe('Images', () => {
  let service: Images;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient()],
    });
    service = TestBed.inject(Images);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
