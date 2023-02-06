import UserService from "../service/UserService.js";
import ApiResponse from "../../dto/ApiResponseDto.js";
import { NextFunction, Request, Response } from "express";

class UserController {
  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id = "", email = "", phone = "", password = "", newPassword = "", confirm = "" } = req.body;
      const apiResponse = await UserService.edit(id, email, phone, password, newPassword, confirm);
      return res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  }
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { login = "", password = "", confirm = "" } = req.body;
      const apiResponse = await UserService.registration(login, password, confirm);
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

  async getKeyRecoveryPass(req: Request, res: Response, next: NextFunction) {
    try {
      const { login = "" } = req.body;
      const apiResponse = await UserService.getKeyRecoveryPass(login);
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
      const { recoveryKey = "", password = "", confirm = "" } = req.body;
      const apiResponse = await UserService.recovery(recoveryKey, password, confirm);
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
