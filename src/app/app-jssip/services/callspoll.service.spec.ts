import { TestBed, inject } from '@angular/core/testing';

import { CallspollService } from './callspoll.service';

describe('CallspollService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CallspollService]
    });
  });

  it('should be created', inject([CallspollService], (service: CallspollService) => {
    expect(service).toBeTruthy();
  }));
});
