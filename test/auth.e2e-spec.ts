import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";
import * as request from 'supertest';
import { User } from "../src/users/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role } from "../src/auth/role.enum";
import * as cookieParser from 'cookie-parser';


describe('Auth System (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        //Create one test user
        const userRepository = moduleFixture.get(getRepositoryToken(User));
        const user = new User();
        user.email = 'test@test.com';
        user.passwordHash = '$2b$12$9PbJdX1YjSmkAx5/dXPJY.hs./azciFRLfb3mrvs0LUFCtH2Sv1rO'; //12345678
        user.firstName = 'Bob';
        user.lastName = 'Test';
        user.role = Role.Admin;
        user.verificationToken = 'abcde';
        user.emailVerified = true;
        await userRepository.save(user);


        const unverifiedUser = new User();
        unverifiedUser.email = 'unverified@test.com';
        unverifiedUser.passwordHash = '$2b$12$9PbJdX1YjSmkAx5/dXPJY.hs./azciFRLfb3mrvs0LUFCtH2Sv1rO'; //12345678
        unverifiedUser.firstName = 'Unverified';
        unverifiedUser.lastName = 'Test';
        unverifiedUser.role = Role.User;
        unverifiedUser.emailVerified = false;
        unverifiedUser.verificationToken = 'abcdef'
        await userRepository.save(unverifiedUser);

    });

    it('should signin test user', () => {
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


    it('shold not be able to sign in with an unverified user', async () => {
        const email = 'unverified@test.com';
        const password = '12345678';

        return request(app.getHttpServer())
            .post('/auth/signin')
            .send({ email, password })
            .expect(401)
            .then(res => {
                const { message } = res.body;
                expect(message).toBe('Email must be verified');
            });
    });

    it('should verify an user email', async () => {
        const email = 'unverified@test.com';
        const password = '12345678';
        const token = 'abcdef';

        await request(app.getHttpServer())
            .get('/auth/verify-email?token=' + token)
            .expect(200)
            .then(res => {
                const { message } = res.body;
                expect(message).toBe('email address was successfully verified');
            });

        await request(app.getHttpServer())
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

    it('should refresh token', async () => {
        const email = 'test@test.com';
        const password = '12345678';

        let cookie: any;

        const authResponse = await request(app.getHttpServer())
            .post('/auth/signin')
            .send({ email, password })
            .expect(201)
            .then(res => {
                const { id, email, access_token } = res.body;
                expect(id).toBeDefined();
                expect(email).toBeDefined();
                expect(access_token).toBeDefined();

                console.log('access_token-1', access_token);

                return res;
            });

        cookie = authResponse.get('Set-Cookie');

        // wait 100ms
        await new Promise((r) => setTimeout(r, 100));

        const refreshResponse = await request(app.getHttpServer())
            .post('/auth/refresh-token')
            .set('Cookie', cookie)
            .send()
            .expect(201)
            .then(res => {
                const { id, email, access_token } = res.body;
                expect(id).toBeDefined();
                expect(email).toBeDefined();
                expect(access_token).toBeDefined();

                console.log('access_token-2', access_token);

                return res;
            });

        expect(authResponse.body.access_token).not.toBe(refreshResponse.body.access_token);
    });

});