import { Test, TestingModule } from '@nestjs/testing';
import { KotdController } from './kotd.controller';

describe('KotdController', () => {
  let controller: KotdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KotdController],
    }).compile();

    controller = module.get<KotdController>(KotdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
