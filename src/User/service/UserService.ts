import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import TokenService from "./TokenService.js";
import UserDto from "../dto/UserDto.js";
import ApiError from "../../exception/ApiError.js";
import ApiResponse from "../../dto/ApiResponseDto.js";
import Validdata from "../../utils/Validdata.js";
import CreatingKeys from "../../utils/CreatingKeys.js";

class UserService {
  async registration(login: string, password: string, confirm: string) {
    const apiResponse = new ApiResponse();
    Validdata.checkLogin(login, apiResponse);
    Validdata.checkPassword(password, confirm, apiResponse);
    await Validdata.candidate(login, apiResponse, "check");
    if (!apiResponse.isSuccess()) {
      throw ApiError.ValidationException(apiResponse);
    }
    const loginType = Validdata.loginType(login);
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
      const userDto = new UserDto(user);
      apiResponse.addData(userDto);
      return apiResponse;
    } else {
      apiResponse.setError("recoveryLink", "Некорректный проверочный код");
      throw ApiError.BadRequest(apiResponse);
    }
  }

  async getKeyRecoveryPass(login: string) {
    const apiResponse = new ApiResponse();
    const user = await Validdata.candidate(login, apiResponse, "search");
    if (user !== null) {
      let messageTypeLogin = "почтовый адрес";
      const userDto = new UserDto(user);
      const loginType = Validdata.loginType(login);
      if (loginType == "phone") {
        messageTypeLogin = "номер телефона";
        login = Validdata.phoneFormat(login);
      }
      if (
        (loginType == "phone" && userDto.isActivatedPhone == false) ||
        (loginType == "email" && userDto.isActivatedEmail == false)
      ) {
        apiResponse.setError(
          "login",
          `Вы не подтвердили свой ${messageTypeLogin} ${login} восстановления не возможно, обратитесь в службу поддержки.`
        );
      } else {
        const key = CreatingKeys.keyRecoveryPass();
        await User.update(
          {
            recoveryKey: key,
          },
          { where: { [loginType]: login } }
        );
        if (loginType == "phone") {
          //await функция отправки пароля для востановления на телефон(key);
        } else {
          //await функция отправки пароля для востановления на почту(key)
        }
        apiResponse.addData({
          message: `На ваш ${messageTypeLogin} ${login} был отправлен проверочный код восстановления пароля.`,
        });
      }
    }
    if (!apiResponse.isSuccess()) {
      throw ApiError.BadRequest(apiResponse);
    }
    return apiResponse;
  }

  async login(login: string, password: string) {
    const apiResponse = new ApiResponse();
    const user = await Validdata.candidate(login, apiResponse, "search");
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

  async edit(id: string, email: string, phone: string, password: string, newPassword: string, confirm: string) {
    const apiResponse = new ApiResponse();
    const user = await User.findOne({ where: { id } });
    if (user) {
      if (email) {
        user.email = email;
        user.isActivatedEmail = false;
        await user.save();
        //await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
      } else if (phone) {
        user.phone = phone;
        user.isActivatedPhone = false;
        await user.save();
        //отправить ссылку на активацию телефона;
      } else if (password) {
      }
      const userDto = new UserDto(user);
      return apiResponse;
    } else {
      apiResponse.setError("id", "Не авторизован");
    }
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
