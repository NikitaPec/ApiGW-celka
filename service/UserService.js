import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import MailService from "./MailService.js";
import TokenService from "./TokenService.js";
import UserDto from "../dto/UserDto.js";
import ApiError from "../exception/ApiError.js";
import ApiResponse from "../dto/ApiResponseDto.js";

function LoginTypeChecking(login) {
  return login.indexOf("@") >= 0 ? "email" : "phone";
}
function phoneNormalization(phone) {
  return phone.replace(/(\+7|8)[\s(]?(\d{3})[\s)]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g, "+7($2)$3-$4-$5");
}

class UserService {
  async registration(login, password) {
    const loginType = LoginTypeChecking(login);
    if (loginType == "phone") {
      login = phoneNormalization(login);
    }
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
    return ApiResponse.setData({ ...tokens, user: userDto });
  }

  async activate(activationLink) {
    const apiResponse = new ApiResponse();
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      apiResponse.setError("activationLink", "Некорректная ссылка активации");
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    user.isActivated = true;
    await user.save();
  }

  async login(login, password) {
    let messageBadLogin = `Пользователь с почтовым адресом ${login} не существует`;
    const apiResponse = new ApiResponse();
    const loginType = LoginTypeChecking(login);
    if (loginType == "phone") {
      login = phoneNormalization(login);
      messageBadLogin = `Пользователь с номером телефона ${login} не существует`;
    }
    const user = await User.findOne({ where: { [loginType]: login } });
    if (!user) {
      apiResponse.setError("login", messageBadLogin);
    } else {
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        apiResponse.setError("password", "Неверный пароль");
      }
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    const hashPassword = user.password;
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    apiResponse.addData({ ...tokens, user: userDto });
    return apiResponse;
  }
  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken);
    return ApiResponse.setData(token);
  }

  async refresh(refreshToken) {
    const apiResponse = new ApiResponse();
    if (!refreshToken) {
      apiResponse.setError("authorized", "Не авторизован");
      throw ApiError.BadRequest(apiResponse);
    }
    const refreshTokenValidate = TokenService.validateRefreshToken(refreshToken);
    const refreshTokenFromDB = await TokenService.findToken(refreshToken);
    if (!refreshTokenValidate || !refreshTokenFromDB) {
      apiResponse.setError("authorized", "Не авторизован");
      throw ApiError.BadRequest(apiResponse);
    }

    const id = refreshTokenFromDB.userId;
    const user = await User.findOne({ where: { id } });
    const hashPassword = user.password;
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    apiResponse.addData({ ...tokens, user: userDto });
    return apiResponse;
  }
  async getAllUsers() {
    const users = await User.findAll();
    return users;
  }
}

export default new UserService();
