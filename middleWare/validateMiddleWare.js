import ApiError from "../exception/ApiError.js";
import ApiResponse from "../dto/ApiResponseDto.js";
import User from "../model/UserModel.js";
import _ from "lodash";
export default async function (req, res, next) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { login = false, password = false, confirm = false } = req.body;
    const regularValidMail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const regularValidPhone = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
    const regularValidPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}/g;
    const phoneForm = login.replace(/(\+7|8)[\s(]?(\d{3})[\s)]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g, "+7($2)$3-$4-$5");
    const validMail = regularValidMail.test(login);
    const validPhone = regularValidPhone.test(phoneForm);
    const validPass = regularValidPassword.test(password);
    const response = new ApiResponse();
    async function candidate(value) {
      return User.findOne({ where: value });
    }
    function LoginTypeChecking(login) {
      return login.indexOf("@") >= 0 ? "email" : "phone";
    }
    const loginType = LoginTypeChecking(login);
    if (!login) {
      response.setError("login", "Поле обязательно для заполнения");
    } else {
      switch (loginType) {
        case "email":
          if (!validMail) response.setError("login", "Некорректный адрес электронной почты");
          if (await candidate({ [loginType]: login }))
            response.setError("login", `Пользователь с почтовым адресом ${login} уже существует`);
          break;
        case "phone":
          if (!validPhone) response.setError("login", "Некорректный номер телефона");
          if (await candidate({ [loginType]: phoneForm }))
            response.setError("login", `Пользователь с номером ${phoneForm} уже существует`);
          break;
        default:
      }
    }
    if (!password) response.setError("password", "Поле обязательно для заполнения");
    if (!confirm) response.setError("confirm", "Поле обязательно для заполнения");
    if (_.isEqual(confirm, password) == false) response.setError("confirm", "Пароли не совпадают");
    if (!validPass)
      response.setError(
        "password",
        "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной"
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
