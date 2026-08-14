import { Test, TestingModule } from '@nestjs/testing';
import { KotdController } from './kotd.controller';
import { KotdService } from './kotd.service';

describe('KotdController', () => {
  let controller: KotdController;

  const mockKotdService = {
    getJerseyOfTheDay: jest.fn(),
    toggleLike: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KotdController],
      providers: [{ provide: KotdService, useValue: mockKotdService }],
    }).compile();

    controller = module.get<KotdController>(KotdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
