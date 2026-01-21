import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { MemberService } from './member.service';
import { Member } from './member.entity';

describe('MemberService', () => {
  let service: MemberService;

  const mocks = {
    repository: {
      findOne: jest.fn(),
      find: jest.fn()
    },
    clsService: {
      get: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: mocks.repository,
        },
        {
          provide: ClsService,
          useValue: mocks.clsService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    mocks.clsService.get.mockImplementation((key: string) => {
      if (key === 'user.id') return 'user.123';
      if (key === 'company.id') return 'company.456';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMember', () => {
    it.each([
      {
        description: 'should return a member if it exists',
        mockReturn: { id: 'm1', user: { id: 'user.123' }, company: { id: 'company.456' } } as Member,
        expected: { id: 'm1', user: { id: 'user.123' }, company: { id: 'company.456' } } as Member,
      },
      {
        description: 'should return null if it does not exist',
        mockReturn: null,
        expected: null,
      },
    ])('$description', async ({ mockReturn, expected }) => {
      mocks.repository.findOne.mockResolvedValue(mockReturn);

      const result = await service.getMemberActive();

      expect(mocks.repository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: 'user.123' },
          company: { id: 'company.456' },
        },
        loadRelationIds: true
      });
      expect(result).toEqual(expected);
    });
  });


  describe('getCompanies', () => {
    it.each([
      {
        description: 'should return company ids for current user',
        userId: 'user.123',
        mockReturn: [
          { company: 'company-1' },
          { company: 'company-2' },
          { company: 'company-3' },
        ] as unknown as Member[],
        expected: ['company-1', 'company-2', 'company-3'],
      },
      {
        description: 'should return empty array when user has no companies',
        userId: 'user.456',
        mockReturn: [] as Member[],
        expected: [],
      },
      {
        description: 'should handle undefined userId from cls',
        userId: undefined,
        mockReturn: [] as Member[],
        expected: [],
      },
    ])('$description', async ({ userId, mockReturn, expected }) => {
      mocks.clsService.get.mockReturnValue(userId);
      mocks.repository.find.mockResolvedValue(mockReturn);

      const result = await service.getCompanies();

      expect(result).toEqual(expected);
      expect(mocks.clsService.get).toHaveBeenCalledWith('user.id');
      expect(mocks.repository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        loadRelationIds: { relations: ['company'] },
      });
    });
  });
});