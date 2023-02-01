import jwt from "jsonwebtoken";
import Token from "../model/TokenModel.js";

class TokenService {
  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY as string);
      return userData;
    } catch (e) {
      return null;
    }
  }
  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY as string);
      return userData;
    } catch (e) {
      return null;
    }
  }
  generateTokens(payload: string | object) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY as string, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY as string, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }
  async saveToken(userId: string | number, refreshToken: string) {
    userId = Number(userId);
    const tokenData = await Token.findOne({ where: { userId } });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await tokenData.save();
    }
    const token = await Token.create({ userId, refreshToken });
    return token;
  }
  async removeToken(refreshToken: string) {
    const tokenData = await Token.destroy({ where: { refreshToken } });
    return tokenData;
  }
  async findToken(refreshToken: string) {
    const tokenData = await Token.findOne({ where: { refreshToken } });
    return tokenData;
  }
}

export default new TokenService();
