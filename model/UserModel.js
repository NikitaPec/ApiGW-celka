import { DataTypes } from "sequelize";
import sequelise from "../db.js";

const User = sequelise.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, unique: true },
  isActivatedEmail: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActivatedPhone: { type: DataTypes.BOOLEAN, defaultValue: false },
  activationLink: { type: DataTypes.STRING },
});

export default User;
