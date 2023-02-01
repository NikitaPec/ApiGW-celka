import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../dataBase/db.js";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string | null;
  declare password: string;
  declare name: string | null;
  declare role: string;
  declare phone: string | null;
  declare isActivatedEmail: boolean;
  declare isActivatedPhone: boolean;
  declare activationLink: string | null;
  declare recoveryLink: string | null;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING, unique: true },
    isActivatedEmail: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActivatedPhone: { type: DataTypes.BOOLEAN, defaultValue: false },
    activationLink: { type: DataTypes.STRING },
    recoveryLink: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "User" }
);

export default User;
