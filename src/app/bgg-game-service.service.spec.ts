import { TestBed } from '@angular/core/testing';

import { BggGameServiceService } from './bgg-game-service.service';

describe('BggGameServiceService', () => {
  let service: BggGameServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BggGameServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
