import UserService from "../service/UserService.js";
import ApiError from "../exception/ApiError.js";
import TokenService from "../service/TokenService.js";
import ApiResponse from "../dto/ApiResponseDto.js";

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await UserService.registration(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      userData.refreshToken = true;
      return res.json(ApiResponse.setData(userData));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await UserService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      userData.refreshToken = true;
      return res.json(ApiResponse.setData(userData));
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(ApiResponse.setData(token));
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const activatationLink = req.params.link;
      await UserService.activate(activatationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      userData.refreshToken = true;
      return res.json(ApiResponse.setData(userData));
    } catch (error) {
      next(error);
    }
  }

  async checkAuth(req, res, next) {
    try {
      return res.json(ApiResponse.setData());
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();
