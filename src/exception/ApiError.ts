export default class ApiError {
  status;
  response;

  constructor(status: number, response: object) {
    this.status = status;
    this.response = response;
  }

  static UnauthorizedError(response: object) {
    return new ApiError(401, response);
  }

  static BadRequest(response: object) {
    return new ApiError(400, response);
  }

  static ValidationException(response: object) {
    return new ApiError(417, response);
  }
}
