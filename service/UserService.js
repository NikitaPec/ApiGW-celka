import User from '../model/UserModel.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import MailService from './MailService.js';
import TokenService from './TokenService.js';
import UserDto from '../dto/UserDto.js';
import ApiError from '../exception/ApiError.js';

class UserService {
  async registration(email, password) {
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();
    const user = await User.create({
      email,
      password: hashPassword,
      activationLink,
    });
    await MailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }
    user.isActivated = true;
    await user.save();
  }
  
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} не существует`
      );
    }
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw ApiError.BadRequest(`Неверный пароль`);
    }
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });
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
    const refreshTokenValidate =
      TokenService.validateRefreshToken(refreshToken);
    const refreshTokenFromDB = await TokenService.findToken(refreshToken);
    if (!refreshTokenValidate || !refreshTokenFromDB) {
      throw ApiError.UnauthorizedError();
    }
    const id = refreshTokenFromDB.userId;
    const user = await User.findOne({ where: { id } });
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
  async getAllUsers() {
    const users = await User.findAll();
    return users;
  }
}

export default new UserService();
