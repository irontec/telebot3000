import { TestBed, inject } from '@angular/core/testing';

import { ConfigurationStoreService } from './configuration-store.service';

describe('ConfigurationStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigurationStoreService]
    });
  });

  it('should be created', inject([ConfigurationStoreService], (service: ConfigurationStoreService) => {
    expect(service).toBeTruthy();
  }));
});
