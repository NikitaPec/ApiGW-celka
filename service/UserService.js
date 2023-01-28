import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import MailService from "./MailService.js";
import TokenService from "./TokenService.js";
import UserDto from "../dto/UserDto.js";
import ApiError from "../exception/ApiError.js";

function LoginTypeChecking(login) {
  return login.indexOf("@") >= 0 ? "email" : "phone";
}

class UserService {
  async registration(login, password) {
    const loginType = LoginTypeChecking(login);
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();
    const user = await User.create({
      [loginType]: login,
      password: hashPassword,
      activationLink,
    });
    //await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      throw ApiError.BadRequest("Некорректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(login, password) {
    const loginType = LoginTypeChecking(login);
    const user = await User.findOne({ where: { [loginType]: login } });
    if (!user) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не существует`);
    }
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw ApiError.BadRequest(`Неверный пароль`);
    }
    const hashPassword = user.password;
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken);
    return token;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const refreshTokenValidate = TokenService.validateRefreshToken(refreshToken);
    const refreshTokenFromDB = await TokenService.findToken(refreshToken);
    if (!refreshTokenValidate || !refreshTokenFromDB) {
      throw ApiError.UnauthorizedError();
    }
    const id = refreshTokenFromDB.userId;
    const user = await User.findOne({ where: { id } });
    const hashPassword = user.password;
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
  async getAllUsers() {
    const users = await User.findAll();
    return users;
  }
}

export default new UserService();
