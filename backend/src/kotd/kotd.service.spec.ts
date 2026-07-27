import { Test, TestingModule } from '@nestjs/testing';
import { KotdService } from './kotd.service';

describe('KotdService', () => {
  let service: KotdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KotdService],
    }).compile();

    service = module.get<KotdService>(KotdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
