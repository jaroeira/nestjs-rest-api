import { DataSource } from "typeorm";
import { configService } from './config/config.service';

export default new DataSource(configService.getTypeOrmDatabaseOptions());