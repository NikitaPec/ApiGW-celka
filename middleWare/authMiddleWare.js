import ApiError from '../exception/ApiError.js';
import TokenService from '../service/TokenService.js';

export default function (req, res, next) {
  try {
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }
    const accessTokenValidate =
      TokenService.validateAccessToken(accessToken);
    if (!accessTokenValidate) {
      return next(ApiError.UnauthorizedError());
    }
    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}
