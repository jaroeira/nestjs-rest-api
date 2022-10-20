import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";
import * as request from 'supertest';
import { User } from "../src/users/user.entity";


describe('Auth System (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        //Create one test user
        const userRepository = moduleFixture.get('UserRepository');
        const user = new User();
        user.email = 'test@test.com';
        user.passwordHash = '$2b$12$9PbJdX1YjSmkAx5/dXPJY.hs./azciFRLfb3mrvs0LUFCtH2Sv1rO';
        user.firstName = 'Bob';
        user.lastName = 'Test';
        await userRepository.save(user);

    });

    it('shoudl signin test user', () => {
        const email = 'test@test.com';
        const password = '12345678';

        return request(app.getHttpServer())
            .post('/auth/signin')
            .send({ email, password })
            .expect(201)
            .then(res => {
                const { id, email, access_token } = res.body;
                expect(id).toBeDefined();
                expect(email).toBeDefined();
                expect(access_token).toBeDefined();
            });
    });

    it('should fail signin with wrong password', () => {
        const email = 'test@test.com';
        const password = '123456789';

        return request(app.getHttpServer())
            .post('/auth/signin')
            .send({ email, password })
            .expect(401)
            .then(res => {
                const { statusCode, message } = res.body;
                expect(statusCode).toBeDefined();
                expect(message).toBeDefined();
                expect(message).toBe('Unauthorized');
            });
    });
});