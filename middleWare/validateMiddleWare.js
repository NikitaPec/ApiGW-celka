import ApiError from "../exception/ApiError.js";
import ApiResponse from "../dto/ApiResponseDto.js";
import User from "../model/UserModel.js";
import _ from "lodash";
export default async function (req, res, next) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("адрессс", req.socket.remoteAddress);
    const regularValidMail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const regularValidPhone = /^[\d\+][\d\(\)\ -]{4,14}\d$/;
    const regularValidPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}/g;
    const { email, password, confirm } = req.body;
    const validMail = regularValidMail.test(email);
    const validPass = regularValidPassword.test(password);
    const candidate = await User.findOne({ where: { email } });
    const response = new ApiResponse();
    if (!email) response.setError("email", "Поле обязательно для заполнения");
    if (!password)
      response.setError("password", "Поле обязательно для заполнения");
    if (!confirm)
      response.setError("confirm", "Поле обязательно для заполнения");
    if (_.isEqual(confirm, password) == false)
      response.setError("confirm", "Пароли не совпадают");
    if (!validMail)
      response.setError("email", "Некорректный адрес электронной почты");
    if (!validPass)
      response.setError(
        "password",
        "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной"
      );
    if (candidate)
      response.setError(
        "email",
        `Пользователь с почтовым адресом ${email} уже существует`
      );

    if (response.isSuccess()) {
      return next();
    } else {
      return next(ApiError.ValidationException(response));
    }
  } catch (errors) {
    console.log(errors);
    next(errors);
  }
}
