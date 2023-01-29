import UserService from "../service/UserService.js";
import ApiError from "../exception/ApiError.js";
import TokenService from "../service/TokenService.js";
import ApiResponse from "../dto/ApiResponseDto.js";

class UserController {
  async registration(req, res, next) {
    try {
      const { login, password } = req.body;
      const apiResponse = await UserService.registration(login, password);
      res.cookie("refreshToken", apiResponse.data.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      apiResponse.data.refreshToken = true;
      return res.json(apiResponse);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { login, password } = req.body;
      const apiResponse = await UserService.login(login, password);
      res.cookie("refreshToken", apiResponse.data.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      apiResponse.data.refreshToken = true;
      return res.json(apiResponse);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const apiResponse = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(apiResponse);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const activatationLink = req.params.link;
      await UserService.activate(activatationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const apiResponse = await UserService.refresh(refreshToken);
      res.cookie("refreshToken", apiResponse.data.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      apiResponse.data.refreshToken = true;
      return res.json(apiResponse);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async checkAuth(req, res, next) {
    try {
      return res.json(ApiResponse.setData());
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

export default new UserController();
