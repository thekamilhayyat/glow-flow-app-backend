import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { ClientEntity } from '../../database/entities/clients.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: Repository<ClientEntity>;

  const mockClient: ClientEntity = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    dateOfBirth: new Date('1990-01-01'),
    isVip: false,
    tags: ['regular'],
    notes: 'Test client',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockClient]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
            findOne: jest.fn().mockResolvedValue(mockClient),
            create: jest.fn().mockReturnValue(mockClient),
            save: jest.fn().mockResolvedValue(mockClient),
            remove: jest.fn().mockResolvedValue(mockClient),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<Repository<ClientEntity>>(getRepositoryToken(ClientEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      const filters = { page: 1, limit: 10 };
      const result = await service.findAll(filters);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual([mockClient]);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockClient);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const clientData = { firstName: 'Jane', lastName: 'Smith' };
      const result = await service.create(clientData);

      expect(result).toEqual(mockClient);
      expect(repository.create).toHaveBeenCalledWith(clientData);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateData = { firstName: 'Jane Updated' };
      const result = await service.update('1', updateData);

      expect(result).toEqual(mockClient);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      await service.remove('1');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.remove).toHaveBeenCalledWith(mockClient);
    });
  });
});
