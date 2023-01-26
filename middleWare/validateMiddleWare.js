import ApiError from "../exception/ApiError.js";
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
    const errors = {};
    const validMail = regularValidMail.test(email);
    const validPass = regularValidPassword.test(password);
    const candidate = await User.findOne({ where: { email } });
    console.log(_.isEqual(confirm, password));
    if (!email) {
      errors.email
        ? errors.email.push("Поле обязательно для заполнения")
        : (errors.email = ["Поле обязательно для заполнения"]);
    }
    if (!password) {
      errors.password
        ? errors.password.push("Поле обязательно для заполнения")
        : (errors.password = ["Поле обязательно для заполнения"]);
    }
    if (!confirm) {
      errors.confirm
        ? errors.confirm.push("Поле обязательно для заполнения")
        : (errors.confirm = ["Поле обязательно для заполнения"]);
    }
    if (_.isEqual(confirm, password) == false) {
      errors.confirm
        ? errors.confirm.push("Пароли не совпадают")
        : (errors.confirm = ["Пароли не совпадают"]);
    }
    if (!validMail) {
      errors.email
        ? errors.email.push("Некорректный адрес электронной почты")
        : (errors.email = ["Некорректный адрес электронной почты"]);
    }
    if (!validPass) {
      errors.password
        ? errors.password.push(
            "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной"
          )
        : (errors.password = [
            "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной",
          ]);
    }
    if (candidate) {
      errors.email
        ? errors.email.push(
            `Пользователь с почтовым адресом ${email} уже существует`
          )
        : (errors.email = [
            `Пользователь с почтовым адресом ${email} уже существует`,
          ]);
    }
    if (errors.email || errors.password || errors.email) {
      return res.json({ success: false, data: {}, errors: errors });
    }
    return next();
  } catch (errors) {
    next(errors);
  }
}
