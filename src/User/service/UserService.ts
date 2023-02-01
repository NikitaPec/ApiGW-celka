import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import TokenService from "./TokenService.js";
import UserDto from "../dto/UserDto.js";
import ApiError from "../../exception/ApiError.js";
import ApiResponse from "../../dto/ApiResponseDto.js";

function LoginTypeChecking(login: string) {
  return login.indexOf("@") >= 0 ? "email" : "phone";
}
function phoneNormalization(phone: string) {
  return phone.replace(/(\+7|8)[\s(]?(\d{3})[\s)]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g, "+7($2)$3-$4-$5");
}
async function checkLogin(login: string, apiResponse: ApiResponse) {
  let messageBadLogin = `Пользователь с почтовым адресом ${login} не существует`;
  const loginType = LoginTypeChecking(login);
  if (loginType == "phone") {
    const loginNormal = phoneNormalization(login);
    messageBadLogin = `Пользователь с номером телефона ${loginNormal} не существует`;
  }
  const user = await User.findOne({ where: { [loginType]: login } });
  if (!user) {
    apiResponse.setError("login", messageBadLogin);
  }
  return { user, loginType, login };
}

class UserService {
  async registration(login: string, password: string) {
    const loginType = LoginTypeChecking(login);
    if (loginType == "phone") {
      login = phoneNormalization(login);
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
    return ApiResponse.setData({ ...tokens, user: userDto });
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

  async recovery(recoveryLink: string) {
    const apiResponse = new ApiResponse();
    const user = await User.findOne({ where: { recoveryLink } });
    if (user !== null) {
      apiResponse.addData(user);
      return apiResponse;
    } else {
      apiResponse.setError("recoveryLink", "Некорректная ссылка активации");
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
          //await функция по восстановлению пароля через телефон()
          apiResponse.addData({
            passwordRecovery: "На ваш номер телефона была отправленна ссылка восстановления пароля.",
          });
        }
      } else if (loginType == "email") {
        if (userDto.isActivatedEmail == false) {
          apiResponse.setError(
            "login",
            `Восстановления пароля по почтовому адресу ${login} не возможно, обратитесь в службу поддержки.`
          );
        } else {
          //await функция по восстановлению пароля через почту()
          //await MailService.sendRecoveryMail(loginNormal, `${process.env.CLIENT_URL}/роут рековери`);
          apiResponse.addData({
            passwordRecovery: "На ваш почтовый адрес была отправленна ссылка восстановления пароля.",
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
