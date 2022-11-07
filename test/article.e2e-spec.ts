import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from 'supertest';
import { Repository } from "typeorm";
import { Article } from "../src/articles/entities/article.entity";
import { articlesData } from './testData/articlesData';
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/users/user.entity";
import { Role } from "../src/auth/role.enum";
import { ArticlesService } from "../src/articles/articles.service";
import { join } from 'path';
import { configService } from '../src/config/config.service';
import { exists, deleteArticleImage } from '../src/shared/helper/file-helper';

const getAccessToken = async (server) => {
    await request(server)
        .post('/auth/signup')
        .send({
            firstName: "Mr",
            lastName: "Test",
            email: "test@test.com",
            password: "12345678"
        });

    return request(server).post('/auth/signin').send({ email: 'test@test.com', password: '12345678' })
        .then(response => {
            const { access_token } = response.body;
            return access_token;
        });

};

const seedTestData = async (repositiry: Repository<Article>, data: any[], user: User, articlesService: ArticlesService) => {

    const promises: Promise<any>[] = [];

    for (const item of data) {
        const article = new Article();
        article.title = item.title;
        article.description = item.description;
        article.content = item.content;
        const lowecaseTags = item.tags.map((t: string) => t.toLowerCase());
        article.tags = await articlesService.getTags(lowecaseTags);
        article.createdByUser = user;

        promises.push(repositiry.save(article));
    }

    await Promise.all(promises);
};


describe('Article (e2e)', () => {
    let app: INestApplication;
    let articleRepository: Repository<Article>;
    let articlesService: ArticlesService;
    let accessToken: string;
    let user: User;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        articleRepository = moduleFixture.get(getRepositoryToken(Article));
        articlesService = moduleFixture.get(ArticlesService);

        accessToken = await getAccessToken(app.getHttpServer());
        user = new User();
        user.id = 1;
        user.email = 'test@test.com';
        user.firstName = 'Mr';
        user.lastName = 'Test';
        user.role = Role.Admin;

        await seedTestData(articleRepository, articlesData, user, articlesService);

    });

    it('should create an article', async () => {
        const response = await request(app.getHttpServer()).post('/articles')
            .auth(accessToken, { type: 'bearer' })
            .send({
                title: "Create Test",
                description: "Create Description",
                content: "Create Content",
                tags: ["tag1", "tag2"]
            }).expect(201).then((res) => res.body);


        expect(response).toBeDefined();
        expect(response.title).toBe('Create Test');
        expect(response.author.email).toBe('test@test.com');
        expect(response.tags.length).toBe(2);
    });

    it('should get one article by id', async () => {
        await request(app.getHttpServer()).get('/articles/1')
            .auth(accessToken, { type: 'bearer' })
            .expect(200).then((res) => {
                const { id } = res.body;
                expect(id).toBe(1);
            });

        await request(app.getHttpServer()).get('/articles/100000')
            .auth(accessToken, { type: 'bearer' })
            .expect(404);
    });


    describe('/articles/upload-image/ end-pont', () => {

        it('should upload image to article', async () => {
            const testFilePath = join(__dirname, 'testData', 'test-image.jpg');

            const response = await request(app.getHttpServer())
                .post('/articles/upload-image/1')
                .attach('image', testFilePath)
                .auth(accessToken, { type: 'bearer' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBeDefined();

            const uploadedFileName = response.body.name;
            const uploadDir = configService.getArticleUploadFolder();
            const uploadedFilePath = join(__dirname, '..', uploadDir, uploadedFileName);

            expect(await exists(uploadedFilePath)).toBeTruthy();

            await deleteArticleImage(uploadedFilePath);

            await request(app.getHttpServer()).get('/articles/1')
                .auth(accessToken, { type: 'bearer' })
                .expect(200).then((res) => {
                    const { id, images } = res.body;
                    expect(id).toBe(1);
                    expect(images.length).toBe(1);
                    expect(images[0].name).toBe(uploadedFileName);

                });
        });


        it('should fail to upload a file that is not an image', async () => {
            const testFilePath = join(__dirname, 'testData', 'test-image.zip');

            const response = await request(app.getHttpServer())
                .post('/articles/upload-image/1')
                .attach('image', testFilePath)
                .auth(accessToken, { type: 'bearer' });


            expect(response.status).toBe(415);
            expect(response.body.message).toBe('File type is not matching: image');
        });

    });


    describe('PUT /articles/upload-image/:id end-pont', () => {


        it('should update an article', async () => {

            // Add an image to article id: 1
            const testFilePath = join(__dirname, 'testData', 'test-image.jpg');
            await request(app.getHttpServer())
                .post('/articles/upload-image/1')
                .attach('image', testFilePath)
                .auth(accessToken, { type: 'bearer' });


            const response = await request(app.getHttpServer()).put('/articles/1')
                .auth(accessToken, { type: 'bearer' })
                .send({
                    title: "Updated Test",
                    description: "Updated Description",
                    content: "Updated Content",
                    tags: ["tag1", "tag2", "updated-tag"],
                    images: [] // on update send an empty images array. image shoud be removed
                }).expect(200).then((res) => {

                    const { id, title, description, tags, images } = res.body;

                    expect(id).toBe(1);
                    expect(title).toBe('Updated Test');
                    expect(description).toBe('Updated Description');
                    expect(tags.length).toBe(3);
                    expect(images.length).toBe(0);
                });
        });

    });

    describe('POST articles/like-article/:id end-pont', () => {


        it('should like and unlike an article', async () => {
            await request(app.getHttpServer())
                .post('/articles/like-article/1')
                .auth(accessToken, { type: 'bearer' })
                .expect(201).then(res => {
                    const { message } = res.body;
                    expect(message).toBe('added like to article 1');
                });


            await request(app.getHttpServer())
                .post('/articles/like-article/1')
                .auth(accessToken, { type: 'bearer' })
                .expect(201).then(res => {
                    const { message } = res.body;
                    expect(message).toBe('removed like to article 1');
                });
        });

    });


    describe('DELETE /articles/:id end-pont', () => {

        it('should delete an article', async () => {
            await request(app.getHttpServer())
                .delete('/articles/1')
                .auth(accessToken, { type: 'bearer' })
                .expect(200);

            await request(app.getHttpServer()).get('/articles/1')
                .auth(accessToken, { type: 'bearer' })
                .expect(404);
        });

    });


    describe('GET /articles end-pont', () => {

        it('should get a paginated list of articles', async () => {
            const response = await request(app.getHttpServer()).get('/articles?page=1&take=1')

            expect(response.status).toBe(200);

            const { meta } = response.body;
            expect(meta.page).toBe(1);
            expect(meta.take).toBe(1);
            expect(meta.itemCount).toBe(10);
            expect(meta.pageCount).toBe(10);
            expect(meta.hasPreviousPage).toBeFalsy();
            expect(meta.hasNextPage).toBeTruthy();

            await request(app.getHttpServer()).get('/articles?page=10&take=1')
                .expect(200)
                .then(res => {
                    const { meta } = res.body;

                    expect(meta.page).toBe(10);
                    expect(meta.take).toBe(1);
                    expect(meta.itemCount).toBe(10);
                    expect(meta.pageCount).toBe(10);
                    expect(meta.hasPreviousPage).toBeTruthy();
                    expect(meta.hasNextPage).toBeFalsy();
                })
        });

    });


});