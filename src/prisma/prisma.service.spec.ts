import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { INestApplication } from '@nestjs/common';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mock PrismaClient methods
    service.$connect = jest.fn().mockResolvedValue(undefined);
    service.$on = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should register shutdown hook on enableShutdownHooks', async () => {
    const mockApp = { close: jest.fn() } as unknown as INestApplication;
    let beforeExitCallback: () => Promise<void> = async () => {};

    (service.$on as jest.Mock).mockImplementation((event, callback) => {
      beforeExitCallback = callback;
    });

    await service.enableShutdownHooks(mockApp);
    expect(service.$on).toHaveBeenCalledWith(
      'beforeExit',
      expect.any(Function),
    );

    // Simulate the beforeExit event
    await beforeExitCallback();
    expect(mockApp.close).toHaveBeenCalled();
  });
});
