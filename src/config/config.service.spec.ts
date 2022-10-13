import { configService } from './config.service';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const redefineDotenvPath = (env: string) => {
    const dotenv_path = path.resolve(process.cwd(), `.env.${env}`);
    const result = dotenv.config({ path: dotenv_path });
    if (result.error) { /* do nothing */ }
};

describe('ConfigService', () => {

    const env = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...env }

        redefineDotenvPath('test');

        process.env = env
    });

    afterEach(() => {
        process.env = env
    });

    it('should be defined', () => {
        expect(configService).toBeDefined();
    });

    it('should be runing in test environment', () => {
        expect(configService.getEnvMode()).toBe('test');
    });

    it('should return TEST_VALUE = 12345678', () => {
        expect(configService.getValue('TEST_VALUE')).toBe('12345678');
    });

    it('should throw when a env variable doesnt exist and shoud true is passed as argument', () => {
        expect(() => {
            configService.getValue('VALUE_DOES_NOT_EXIST', true);
        }).toThrow();
    });

    it('should return undefined when false is passed as argument, for a value that doesnt exist', () => {
        expect(configService.getValue('VALUE_DOES_NOT_EXIST', false)).toBeUndefined();;
    });

    it('should return database options for development environment', () => {
        process.env.NODE_ENV = 'development';
        redefineDotenvPath('development');

        const databaseOptions = configService.getTypeOrmDatabaseOptions() as PostgresConnectionOptions;

        expect(databaseOptions).toBeDefined();
        expect(databaseOptions.host).toBe('db');
        expect(databaseOptions.type).toBe('postgres');
        expect(databaseOptions.port).toBe(5432);
    });

    it('should throw config error - missing env.DATABASE_URL', () => {
        process.env.NODE_ENV = 'production';
        expect(() => {
            configService.getTypeOrmDatabaseOptions()
        }).toThrow('config error - missing env.DATABASE_URL');
    });

    it('shoud return a Postgres typeORM module in development mode', () => {
        process.env.NODE_ENV = 'development';
        redefineDotenvPath('development');

        const moduleOptions = configService.getTypeOrmModuleConfig();
        expect(moduleOptions.type).toBeDefined();
        expect(moduleOptions.type).toBe('postgres');
    });

    it('shoud return a sqlite typeORM module in test mode', () => {
        process.env.NODE_ENV = 'test';
        redefineDotenvPath('test');

        const moduleOptions = configService.getTypeOrmModuleConfig();
        expect(moduleOptions.type).toBeDefined();
        expect(moduleOptions.type).toBe('sqlite');
    });

});