import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../dataBase/db.js";
import User from "./UserModel.js";

class Token extends Model<InferAttributes<Token>, InferCreationAttributes<Token>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare refreshToken: string | null;
}

Token.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
    refreshToken: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "Token" }
);

export default Token;
