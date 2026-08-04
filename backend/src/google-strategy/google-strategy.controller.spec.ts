import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategyController } from './google-strategy.controller';

describe('GoogleStrategyController', () => {
  let controller: GoogleStrategyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleStrategyController],
    }).compile();

    controller = module.get<GoogleStrategyController>(GoogleStrategyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
