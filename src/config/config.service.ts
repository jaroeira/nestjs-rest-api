import * as path from 'path';
import * as dotenv from 'dotenv';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerOptions } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

class ConfigService {

    constructor(private env: { [k: string]: string | undefined }) { }

    public getValue(key: string, throwOnMissing = true): string {
        const value = this.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing env.${key}`);
        }
        return value;
    }


    public getEnvMode(): string {
        return process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    }

    private getTestDatabaseConfig() {
        return {
            type: 'sqlite',
            database: this.getValue('DB_NAME') || 'db.sqlite',
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: true,
            migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
            migrationsRun: false
        } as SqliteConnectionOptions;
    };

    private getPostgresDatabaseConfig() {

        return {
            type: 'postgres',
            host: this.getValue('POSTGRES_HOST'),
            port: parseInt(this.getValue('POSTGRES_PORT'),),
            username: this.getValue('POSTGRES_USER'),
            password: this.getValue('POSTGRES_PASSWORD'),
            database: this.getValue('POSTGRES_DATABASE'),
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: JSON.parse(this.getValue('SYNCHRONIZE')),
            migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
        } as PostgresConnectionOptions

    };

    private getPostgresProductionDatabaseConfig() {
        return {
            type: 'postgres',
            synchronize: false,
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
            migrationsRun: true,
            url: this.getValue('DATABASE_URL'),
            ssl: {
                rejectUnauthorized: false
            }
        } as PostgresConnectionOptions;
    };

    public getTypeOrmDatabaseOptions() {
        switch (this.getEnvMode()) {
            case 'development':
                return this.getPostgresDatabaseConfig();
            case 'test':
                return this.getTestDatabaseConfig();
            case 'production':
                return this.getPostgresProductionDatabaseConfig();
            default:
                throw new Error('invalid environment');
        }
    }

    public getTypeOrmModuleConfig(): TypeOrmModuleOptions {
        return this.getTypeOrmDatabaseOptions() as TypeOrmModuleOptions;
    }

    public getMailerConfig(): MailerOptions {
        return {
            transport: {
                host: this.getValue('EMAIL_HOST'),
                port: 587,
                tls: {
                    ciphers: 'SSLv3',
                },
                secure: false,
                auth: {
                    user: this.getValue('EMAIL_ID'),
                    pass: this.getValue('EMAIL_PASSWORD')
                }
            },
            defaults: {
                from: this.getValue('EMAIL_FROM')
            },
            template: {
                dir: join(__dirname, '..', 'mail', 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true
                }
            }
        };
    }

    public getUserAvatarUploadFolder() {
        return this.getValue('UPLOAD_USER_AVATAR_FOLDER');
    }

    public getArticleUploadFolder() {
        return this.getValue('UPLOAD_ARTICLE_IMAGE_FOLDER');
    }

}

const env = process.env.NODE_ENV || 'development';
if (env !== 'production') {
    const dotenv_path = path.resolve(process.cwd(), `.env.${env}`);
    const result = dotenv.config({ path: dotenv_path });
    if (result.error) { /* do nothing */ }
}

const configService = new ConfigService(process.env);

export { configService };
