import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getHeapStatistics } from 'v8';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(entity => entity),
  findOneBy: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  remove: jest.fn(entity => entity),
  createQueryBuilder: jest.fn(entity => entity)
}));

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepositoryMock: MockType<Repository<Article>>;
  let tagRepositoryMock: MockType<Repository<Tag>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useFactory: repositoryMockFactory
        },
        {
          provide: getRepositoryToken(Tag),
          useFactory: repositoryMockFactory
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleRepositoryMock = module.get(getRepositoryToken(Article));
    tagRepositoryMock = module.get(getRepositoryToken(Tag));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create tags that are missing and return an array with all tags', async () => {
    const tag1 = new Tag();
    tag1.tagName = 't1';

    const tag2 = new Tag();
    tag2.tagName = 't2';

    const tagsOnDB = [tag1, tag2];

    const createQueryBuilder: any = {
      where: () => createQueryBuilder,
      getMany: () => tagsOnDB
    };

    tagRepositoryMock.createQueryBuilder.mockImplementation(() => createQueryBuilder);

    const result = await service.getTags(['t1', 't2', 't3', 't4']);

    expect(result.length).toBe(4);

    createQueryBuilder.getMany = () => [];

    const result2 = await service.getTags(['t1', 't2', 't3']);

    expect(result2.length).toBe(3);

  });
});
