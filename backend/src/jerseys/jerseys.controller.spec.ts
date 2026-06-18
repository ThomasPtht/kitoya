import { Test, TestingModule } from '@nestjs/testing';
import { JerseysController } from './jerseys.controller';

describe('JerseysController', () => {
  let controller: JerseysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JerseysController],
    }).compile();

    controller = module.get<JerseysController>(JerseysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
