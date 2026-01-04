import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
    let authService: AuthService;
    let jwtService: JwtService;
    let userRepo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue('fake-token')
                    }
                },
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
        jwtService = module.get<JwtService>(JwtService);
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

            const spy = jest.spyOn(jwtService, 'signAsync')

            // Act
            const { payload, token } = await authService.sign({ username: 'jeremi', password: '1234' });

            // Assert
            expect(spy).toHaveBeenCalled();
            expect(token).toBeDefined();
            expect(payload?.sub).toBe('uuid');
            expect(payload?.user?.username).toBe(mockUser.username);
            expect(payload?.user?.role).toBe(mockUser.role);
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
