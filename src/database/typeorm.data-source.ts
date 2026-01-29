import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from './typeorm.config';

export default new DataSource(typeOrmDataSourceOptions);


