import { DataTypes } from 'sequelize';
import sequelise from '../db.js';
import User from './UserModel.js';

const Token = sequelise.define('Token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {type: DataTypes.INTEGER, references: { model: User, key: 'id'} },
  refreshToken: { type: DataTypes.STRING },
});

export default Token;