import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let authService: AuthService;
    let userRepo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepo = module.get(getRepositoryToken(User));
    });

    describe('sign', () => {
        it('should return payload when credentials are valid', async () => {
            // Arrange
            const mockUser = {
                id: 'uuid',
                username: 'jeremi',
                password: bcrypt.hashSync('1234', 10),
                role: 'admin',
                avatar: 'a.png',
            } as unknown as User;

            userRepo.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await authService.sign({ username: 'jeremi', password: '1234' });

            // Assert
            expect(result.sub).toBe('uuid');
            expect(result.user?.username).toBe(mockUser.username);
            expect(result.user?.role).toBe(mockUser.role);
        });

        it('should throw UnauthorizedException when credentials are invalid', async () => {
            // Arrange
            const mockUser = {
                id: 'uuid',
                username: 'jeremi',
                password: bcrypt.hashSync('1234', 10),
            } as unknown as User;

            userRepo.findOne.mockResolvedValue(mockUser);

            // Act + Assert
            await expect(authService.sign({ username: 'jeremi', password: 'wrong' }))
                .rejects
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when user not found', async () => {
            // Arrange
            userRepo.findOne.mockResolvedValue(null);

            // Act + Assert
            await expect(authService.sign({ username: 'jeremi', password: '1234' }))
                .rejects
                .toThrow(UnauthorizedException);
        });
    });
});
