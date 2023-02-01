import UserService from "../service/UserService.js";
import ApiResponse from "../../dto/ApiResponseDto.js";
import { NextFunction, Request, Response } from "express";

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { login = "", password = "" } = req.body;
      const apiResponse = await UserService.registration(login, password);
      res.cookie("refreshToken", apiResponse.data.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      apiResponse.data.refreshToken = true;
      return res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  }

  async passwordRecovery(req: Request, res: Response, next: NextFunction) {
    try {
      const { login = "" } = req.body;
      const apiResponse = await UserService.passwordRecovery(login);
      return res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { login = "", password = "" } = req.body;
      const apiResponse = await UserService.login(login, password);
      res.cookie("refreshToken", apiResponse.data.refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
      });
      apiResponse.data.refreshToken = true;
      return res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const apiResponse = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activatationLink = req.params.link;
      await UserService.activate(activatationLink);
      return res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
      next(error);
    }
  }

  async recovery(req: Request, res: Response, next: NextFunction) {
    try {
      const recoveryLink = req.params.link;
      const apiResponse = await UserService.recovery(recoveryLink);
      res.json(apiResponse);
      return res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
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
      next(error);
    }
  }

  async checkAuth(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(ApiResponse.setData());
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
