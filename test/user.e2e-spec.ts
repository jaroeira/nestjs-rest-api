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

    it('should refuse unauthenticated requests on all /users routes', async () => {
        // List All Users
        await request(app.getHttpServer())
            .get('/users')
            .expect(401);

        // Find user by id
        await request(app.getHttpServer())
            .get('/users/1')
            .expect(401);

        // Delete user
        await request(app.getHttpServer())
            .delete('/users/2')
            .expect(401);

        // Create user
        await request(app.getHttpServer())
            .post('/users')
            .send({ "email": "create@test.com", "password": "12345678", "firstName": "Create", "lastName": "test" })
            .expect(401);

        // Update user
        await request(app.getHttpServer())
            .put('/users/2')
            .send({ "email": "create@test.com", "firstName": "Create", "lastName": "test" })
            .expect(401);

        // Change Password
        await request(app.getHttpServer())
            .post('/users/change-password')
            .send({ "id": 2, "newPassword": "123456789" })
            .expect(401);
    });


    it('should refuse requests on all /users routes from non ADMIN users', async () => {
        const email = 'test@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        // List All Users
        await request(app.getHttpServer())
            .get('/users')
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });

        // Find user by id
        await request(app.getHttpServer())
            .get('/users/2')
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });

        // Delete user
        await request(app.getHttpServer())
            .delete('/users/2')
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });

        // Create user
        await request(app.getHttpServer())
            .post('/users')
            .send({ "email": "create@test.com", "password": "12345678", "firstName": "Create", "lastName": "test" })
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });

        // Update user
        await request(app.getHttpServer())
            .put('/users/2')
            .send({ "email": "create@test.com", "firstName": "Create", "lastName": "test" })
            .auth(access_token, { type: 'bearer' })
            .expect(403).then(res => {
                const { message } = res.body;
                expect(message).toBe('Forbidden resource');
            });
    });

    it('shoud allow authenticad admin requests on All /users routes', async () => {
        const email = 'admin@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        // List All Users
        await request(app.getHttpServer())
            .get('/users')
            .auth(access_token, { type: 'bearer' })
            .expect(200).then(res => {
                const users = res.body;
                expect(users).toBeDefined();
                expect(users.length).toBe(2);
            });

        // Create user
        await request(app.getHttpServer())
            .post('/users')
            .send({ "email": "create@test.com", "password": "12345678", "firstName": "Create", "lastName": "test" })
            .auth(access_token, { type: 'bearer' })
            .expect(201).then(res => {
                const { id, email, role } = res.body;
                expect(id).toBe(3);
                expect(email).toBe('create@test.com');
                expect(role).toBe(Role.User);
            });

        // Find user by id
        await request(app.getHttpServer())
            .get('/users/3')
            .auth(access_token, { type: 'bearer' })
            .expect(200).then(res => {
                const { id, email, role } = res.body;
                expect(id).toBe(3);
                expect(email).toBe('create@test.com');
                expect(role).toBe(Role.User);
            });

        // Update user
        const updateRes = await request(app.getHttpServer())
            .put('/users/3')
            .send({ "email": "updated@test.com", "firstName": "Update", "lastName": "test" })
            .auth(access_token, { type: 'bearer' })
            .expect(200);

        await request(app.getHttpServer())
            .get('/users/3')
            .auth(access_token, { type: 'bearer' })
            .expect(200).then(res => {
                const { id, email, role } = res.body;
                expect(id).toBe(3);
                expect(email).toBe('updated@test.com');
            });


        // Delete user
        await request(app.getHttpServer())
            .delete('/users/3')
            .auth(access_token, { type: 'bearer' })
            .expect(200);


        await request(app.getHttpServer())
            .get('/users/3')
            .auth(access_token, { type: 'bearer' })
            .expect(404).then(res => {
                const { message } = res.body;
                expect(message).toBe('No user found with id 3');
            });


    });

    it('A non admin user should be able to change his own password', async () => {
        const email = 'test@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        await request(app.getHttpServer())
            .post('/users/change-password')
            .send({ "id": 2, "newPassword": "123456789" })
            .auth(access_token, { type: 'bearer' })
            .expect(201).then(res => {
                const { message, id } = res.body;
                expect(id).toBe(2);
                expect(message).toBe('Password changed!');
            });
    });

    it('A non admin user should NOT be able to change other users password', async () => {
        const email = 'test@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        await request(app.getHttpServer())
            .post('/users/change-password')
            .send({ "id": 1, "newPassword": "123456789" })
            .auth(access_token, { type: 'bearer' })
            .expect(403);
    });

    it('A admin user should be able to change other users password', async () => {
        const email = 'admin@test.com';
        const password = '12345678';

        const response = await request(app.getHttpServer()).post('/auth/signin').send({ email, password });
        const { access_token } = response.body;

        expect(access_token).toBeDefined();

        await request(app.getHttpServer())
            .post('/users/change-password')
            .send({ "id": 2, "newPassword": "123456789" })
            .auth(access_token, { type: 'bearer' })
            .expect(201);
    });


});