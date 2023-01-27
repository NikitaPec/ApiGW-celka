import ApiResponse from "../dto/ApiResponseDto.js";
import ApiError from "../exception/ApiError.js";
import TokenService from "../service/TokenService.js";

export default function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorizationheader;
    const response = new ApiResponse();

    if (!authorizationHeader) {
      response.setError(
        "headerAuthorization",
        "Отсутствует Header authorization"
      );
    } else {
      const accessToken = authorizationHeader.split(" ")[1];
      if (!accessToken)
        response.setError("accessToken", "Отсутствует токен доступа");
      else {
        const accessTokenValidate = TokenService.validateAccessToken(
          accessToken
        );
        if (!accessTokenValidate)
          response.setError(
            "accessToken",
            "Токен доступа не прошел проверку подлинности"
          );
      }
    }

    if (response.isSuccess()) {
      return next(response);
    } else {
      return next(ApiError.UnauthorizedError(response));
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
}
