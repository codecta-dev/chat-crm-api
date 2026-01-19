import { Test, TestingModule } from '@nestjs/testing';
import { Member } from './member.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;
  let repo: jest.Mocked<Repository<Member>>;
  let cls: jest.Mocked<ClsService>;

  const mocks = {
    repo: {
      findOne: jest.fn(),
      find: jest.fn(),
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
          useValue: mocks.repo,
        },
        {
          provide: ClsService,
          useValue: mocks.clsService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repo = module.get(getRepositoryToken(Member));
    cls = module.get(ClsService);
  });

  describe('getMemberActive', () => {
    it.each([
      {
        name: 'returns the active member',
        userId: 'user-1',
        companyId: 'company-1',
        member: { id: 'm1', user: 'user-1', company: 'company-1', role: 'agent', status: 'active' },
        expected: { id: 'm1', user: 'user-1', company: 'company-1', role: 'agent', status: 'active' },
      },
      {
        name: 'returns null when no active member is found',
        userId: 'user-2',
        companyId: 'company-2',
        member: null,
        expected: null,
      },
    ])('$name', async ({ userId, companyId, member, expected }) => {
      cls.get.mockImplementation((key: string) => {
        if (key === 'user-id') return userId;
        if (key === 'company-id') return companyId;
      });

      repo.findOne.mockResolvedValue(member as unknown as Member);

      const result = await service.getMemberActive();
      expect(result).toEqual(expected);
      expect(mocks.repo.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId }, company: { id: companyId } },
        loadRelationIds: true,
      });
    });
  });

  describe('getCompanies', () => {
    it.each([
      {
        name: 'returns associated companies',
        userId: 'user-1',
        members: [
          { id: 'm1', company: { id: 'c1', name: 'Company A' } },
          { id: 'm2', company: { id: 'c2', name: 'Company B' } },
        ] as any[],
        expected: [{ id: 'c1', name: 'Company A' }, { id: 'c2', name: 'Company B' }],
      },
      {
        name: 'returns empty array when no companies are found',
        userId: 'user-2',
        members: [],
        expected: [],
      },
      {
        name: 'returns empty array when repository returns null',
        userId: 'user-3',
        members: null,
        expected: [],
      },
    ])('$name', async ({ userId, members, expected }) => {
      cls.get.mockImplementation((key: string) => (key === 'user-id' ? userId : null));
      repo.find.mockResolvedValue(members as unknown as Member[]);

      const result = await service.getCompanies();
      expect(result).toEqual(expected);
      expect(mocks.repo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        loadRelationIds: { relations: ['company'] },
      });
    });
  });
});