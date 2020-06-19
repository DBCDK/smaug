'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import Umzug from 'umzug';
import {log} from '../utils';

export async function migrate(sequelize) {
  try {
    const umzug = new Umzug({
      storage: 'sequelize',

      storageOptions: {
        sequelize: sequelize
      },

      migrations: {
        params: [sequelize.getQueryInterface(), Sequelize],
        path: path.join(__dirname, '../migrations')
      }
    });

    await umzug.up();
    log.info('Migrated database');
  } catch (e) {
    log.error('Failed to migrate database');
  }
}

export default function models(config = {}) {
  const basename = path.basename(module.filename);
  const sequelize = new Sequelize(process.env.DATABASE_URI || config.uri, {
    logging: log.debug
  });

  const db = {};

  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      );
    })
    .forEach(function(file) {
      const model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}
