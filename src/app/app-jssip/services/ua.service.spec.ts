import { TestBed, inject } from '@angular/core/testing';

import { UaService } from './ua.service';

describe('UaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UaService]
    });
  });

  it('should be created', inject([UaService], (service: UaService) => {
    expect(service).toBeTruthy();
  }));
});
