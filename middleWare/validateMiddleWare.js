import ApiError from "../exception/ApiError.js";
import User from "../model/UserModel.js";

export default async function (req, res, next) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("адрессс", req.socket.remoteAddress);
    const regularValidMail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const regularValidPhone = /^[\d\+][\d\(\)\ -]{4,14}\d$/;
    const regularValidPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}/g;
    const { email, password } = req.body;
    if (!email || !password) {
      if (!email) {
        errors.email.push("Поле обязательно для заполнения");
      }
      if (!password) {
        errors.password.push("Поле обязательно для заполнения");
      }
      return next(ApiError.ValidationException("Ошибка валидации", errors));
    }
    const validMail = regularValidMail.test(email);
    const validPass = regularValidPassword.test(password);
    const candidate = await User.findOne({ where: { email } });
    if (!validMail || !validPass || candidate) {
      const errors = { email: [], password: [] };
      if (!validMail) {
        errors.email.push("Некорректный адрес электронной почты");
      }
      if (!validPass) {
        errors.password.push(
          "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной"
        );
      }
      if (candidate) {
        errors.email.push(
          `Пользователь с почтовым адресом ${email} уже существует`
        );
      }
      return next(ApiError.ValidationException("Ошибка валидации", errors));
    }
    return next();
  } catch (errors) {
    next(errors);
  }
}
