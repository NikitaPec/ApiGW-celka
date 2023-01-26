export default class ApiError extends Error {
  status;
  errors;
  response;

  constructor(status, response, message) {
    super(message);
    this.status = status;
    this.response = response;
  }

  static UnauthorizedError() {
    return new ApiError(401, "Ошибка авторизации");
  }

  static BadRequest(message, errors = {}) {
    return new ApiError(400, message, errors);
  }

  static ValidationException(response) {
    return new ApiError(417, response);
  }
}
