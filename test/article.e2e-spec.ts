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


});