export default class ApiError extends Error {
  status;
  errors;
  response;

  constructor(status, response, message) {
    super(message);
    this.status = status;
    this.response = response;
  }

  static UnauthorizedError(response) {
    return new ApiError(401, response);
  }

  static BadRequest(response) {
    return new ApiError(400, response);
  }

  static ValidationException(response) {
    return new ApiError(417, response);
  }
}
