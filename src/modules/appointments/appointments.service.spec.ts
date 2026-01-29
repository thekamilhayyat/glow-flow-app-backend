import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentEntity } from '../../database/entities/appointments.entity';
import { AppointmentServicesEntity } from '../../database/entities/appointment_services.entity';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentsRepository: Repository<AppointmentEntity>;
  let appointmentServicesRepository: Repository<AppointmentServicesEntity>;

  const mockAppointment: AppointmentEntity = {
    id: '1',
    clientId: 'client-1',
    staffId: 'staff-1',
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T11:00:00Z'),
    status: 'scheduled',
    notes: 'Test appointment',
    actualStartTime: null,
    actualEndTime: null,
    rating: null,
    feedback: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(AppointmentEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockAppointment]),
            })),
            findOne: jest.fn().mockResolvedValue(mockAppointment),
            create: jest.fn().mockReturnValue(mockAppointment),
            save: jest.fn().mockResolvedValue(mockAppointment),
            remove: jest.fn().mockResolvedValue(mockAppointment),
          },
        },
        {
          provide: getRepositoryToken(AppointmentServicesEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentsRepository = module.get<Repository<AppointmentEntity>>(getRepositoryToken(AppointmentEntity));
    appointmentServicesRepository = module.get<Repository<AppointmentServicesEntity>>(getRepositoryToken(AppointmentServicesEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return appointments with filters', async () => {
      const filters = { clientId: 'client-1' };
      const result = await service.findAll(filters);

      expect(result).toEqual([mockAppointment]);
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('create', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        clientId: 'client-1',
        staffId: 'staff-1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z')
      };

      const result = await service.create(appointmentData);
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('checkAvailability', () => {
    it('should return available when no conflicts', async () => {
      const check = {
        staffId: 'staff-1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z')
      };

      const result = await service.checkAvailability(check);
      expect(result.available).toBe(true);
      expect(result.conflicts).toEqual([]);
    });
  });

  describe('checkIn', () => {
    it('should check in an appointment', async () => {
      const result = await service.checkIn('1');
      expect(result.status).toBe('checked-in');
      expect(result.actualStartTime).toBeDefined();
    });
  });

  describe('complete', () => {
    it('should complete an appointment', async () => {
      const result = await service.complete('1');
      expect(result.status).toBe('completed');
      expect(result.actualEndTime).toBeDefined();
    });
  });
});
