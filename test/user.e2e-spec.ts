import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from 'supertest';
import { Repository } from "typeorm";
import { User } from "../src/users/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role } from "../src/auth/role.enum";



describe('Users API endpoints (e2e)', () => {
    let app: INestApplication;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        userRepository = moduleFixture.get(getRepositoryToken(User));

        const adminUser = new User();
        adminUser.email = 'admin@test.com';
        adminUser.passwordHash = '$2b$12$9PbJdX1YjSmkAx5/dXPJY.hs./azciFRLfb3mrvs0LUFCtH2Sv1rO'; //12345678
        adminUser.firstName = 'Admin';
        adminUser.lastName = 'Test';
        adminUser.role = Role.Admin;
        await userRepository.save(adminUser);

        const user = new User();
        user.email = 'test@test.com';
        user.passwordHash = '$2b$12$9PbJdX1YjSmkAx5/dXPJY.hs./azciFRLfb3mrvs0LUFCtH2Sv1rO'; //12345678
        user.firstName = 'User';
        user.lastName = 'Test';
        user.role = Role.User;
        await userRepository.save(user);

    });

    it('should refuse unauthenticated requests on GET /users', () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(401);
    });


    it('should refuse requests on GET /users from non ADMIN users', async () => {
        const email = 'test@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        return request(app.getHttpServer())
            .get('/users')
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });
    });

    it('shoud allow authenticad admin requests on GET /users', async () => {
        const email = 'admin@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        return request(app.getHttpServer())
            .get('/users')
            .auth(access_token, { type: 'bearer' })
            .expect(200);

    });
});