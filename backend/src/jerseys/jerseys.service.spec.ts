import { Test, TestingModule } from '@nestjs/testing';
import { JerseysService } from './jerseys.service';

describe('JerseysService', () => {
  let service: JerseysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JerseysService],
    }).compile();

    service = module.get<JerseysService>(JerseysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
