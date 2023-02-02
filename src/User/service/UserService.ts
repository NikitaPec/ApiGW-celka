import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import TokenService from "./TokenService.js";
import UserDto from "../dto/UserDto.js";
import ApiError from "../../exception/ApiError.js";
import ApiResponse from "../../dto/ApiResponseDto.js";
import Validdata from "../../utils/Validdata.js";

function keyRecoveryGen() {
  const symbols = "ABDEFGHKMNPQRSTWXZ123456789";
  let key = "";
  for (let i = 0; i < 4; i += 1) {
    const position = Math.floor(Math.random() * symbols.length);
    key += symbols.substring(position, position + 1);
  }
  return key;
}

async function checkLogin(login: string, apiResponse: ApiResponse) {
  let messageBadLogin = `Пользователь с почтовым адресом ${login} не существует`;
  const loginType = Validdata.loginTupe(login);
  if (loginType == "phone") {
    login = Validdata.phoneFormat(login);
    messageBadLogin = `Пользователь с номером телефона ${login} не существует`;
  }
  const user = await User.findOne({ where: { [loginType]: login } });
  if (user == null) {
    apiResponse.setError("login", messageBadLogin);
  }
  return { user, loginType, login };
}

class UserService {
  async registration(login: string, password: string, confirm: string) {
    const apiResponse = new ApiResponse();
    Validdata.checkLogin(login, apiResponse);
    Validdata.checkPassword(password, confirm, apiResponse);
    await Validdata.candidate(login, apiResponse);
    if (!apiResponse.isSuccess()) {
      throw ApiError.ValidationException(apiResponse);
    }
    const loginType = Validdata.loginTupe(login);
    if (loginType == "phone") {
      login = Validdata.phoneFormat(login);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();
    const nameDef = `USER-${Date.now()}`;
    const user = await User.create({
      [loginType]: login,
      password: hashPassword,
      name: nameDef,
      activationLink,
      role: "user",
      isActivatedEmail: false,
      isActivatedPhone: false,
    });
    //await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ password: hashPassword });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    apiResponse.addData({ ...tokens, user: userDto });
    return apiResponse;
  }

  async activate(activationLink: string) {
    const apiResponse = new ApiResponse();
    const user = await User.findOne({ where: { activationLink } });
    if (user !== null) {
      user.isActivatedEmail = true;
      await user.save();
    } else {
      apiResponse.setError("activationLink", "Некорректная ссылка активации");
      throw ApiError.BadRequest(apiResponse);
    }
  }

  async recovery(recoveryKey: string, password: string, confirm: string) {
    const apiResponse = new ApiResponse();
    Validdata.checkPassword(password, confirm, apiResponse);
    if (!apiResponse.isSuccess()) {
      throw ApiError.ValidationException(apiResponse);
    }
    const user = await User.findOne({ where: { recoveryKey } });
    if (user !== null) {
      const hashPassword = await bcrypt.hash(password, 3);
      user.password = hashPassword;
      user.recoveryKey = null;
      await user.save();
      apiResponse.addData(user);
      return apiResponse;
    } else {
      apiResponse.setError("recoveryLink", "Некорректный проверочный код");
      throw ApiError.BadRequest(apiResponse);
    }
  }

  async passwordRecovery(loginUser: string) {
    const apiResponse = new ApiResponse();
    const { user, loginType, login } = await checkLogin(loginUser, apiResponse);
    if (user !== null) {
      const userDto = new UserDto(user);
      if (loginType == "phone") {
        if (userDto.isActivatedPhone == false) {
          apiResponse.setError(
            "login",
            `Восстановления пароля по номеру телефона ${login} не возможно, обратитесь в службу поддержки.`
          );
        } else {
          const key = keyRecoveryGen();
          await User.update(
            {
              recoveryKey: key,
            },
            { where: { [loginType]: login } }
          );
          //await функция отправки пароля для востановления на телефон(key);
          apiResponse.addData({
            passwordRecovery: "На ваш номер телефона была отправлен проверочный код восстановления пароля.",
          });
        }
      } else if (loginType == "email") {
        if (userDto.isActivatedEmail == false) {
          apiResponse.setError(
            "login",
            `Восстановления пароля по почтовому адресу ${login} не возможно, обратитесь в службу поддержки.`
          );
        } else {
          const key = keyRecoveryGen();
          await User.update(
            {
              recoveryKey: key,
            },
            { where: { [loginType]: login } }
          );
          //await функция отправки пароля для востановления на почту(key)
          apiResponse.addData({
            passwordRecovery: "На ваш почтовый адрес был отправлен проверочный код восстановления пароля.",
          });
        }
      }
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    return apiResponse;
  }

  async login(login: string, password: string) {
    const apiResponse = new ApiResponse();
    const { user } = await checkLogin(login, apiResponse);
    if (user !== null) {
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        apiResponse.setError("password", "Неверный пароль");
        throw ApiError.BadRequest(apiResponse);
      }
      const hashPassword = user.password;
      const userDto = new UserDto(user);
      const tokens = TokenService.generateTokens({ password: hashPassword });
      await TokenService.saveToken(userDto.id, tokens.refreshToken);
      apiResponse.addData({ ...tokens, user: userDto });
      return apiResponse;
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    return apiResponse;
  }
  async logout(refreshToken: string) {
    const apiResponse = new ApiResponse();
    if (!refreshToken) {
      apiResponse.setError("refreshToken", "Отсутствует токен в Cookies");
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    await TokenService.removeToken(refreshToken);
    return apiResponse;
  }

  async refresh(refreshToken: string) {
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
    if (user !== null) {
      const hashPassword = user.password;
      const userDto = new UserDto(user);
      const tokens = TokenService.generateTokens({ password: hashPassword });
      await TokenService.saveToken(userDto.id, tokens.refreshToken);
      apiResponse.addData({ ...tokens, user: userDto });
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    return apiResponse;
  }
  async getAllUsers() {
    const users = await User.findAll();
    return users;
  }
}

export default new UserService();
