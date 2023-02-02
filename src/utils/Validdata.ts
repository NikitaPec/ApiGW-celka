import _ from "lodash";
import ApiResponse from "../dto/ApiResponseDto.js";
import User from "../User/model/UserModel.js";

export default class Validdata {
  static loginTupe(login: string): string {
    return login.indexOf("@") >= 0 ? "email" : "phone";
  }
  static checkLogin(login: string, response: ApiResponse) {
    if (login == "") {
      response.setError("login", "Поле обязательно для заполнения");
    } else {
      const loginType = Validdata.loginTupe(login);
      switch (loginType) {
        case "email":
          const regularValidMail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
          const validMail = regularValidMail.test(login);
          if (!validMail) response.setError("login", "Некорректный адрес электронной почты");
          break;
        case "phone":
          const regularValidPhone = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
          const validPhone = regularValidPhone.test(Validdata.phoneFormat(login));
          if (!validPhone) response.setError("login", "Некорректный номер телефона");
          break;
        default:
      }
    }
  }
  static checkPassword(password: string, confirm: string, apiResponse: ApiResponse) {
    if (password == "") apiResponse.setError("password", "Поле обязательно для заполнения");
    if (confirm == "") apiResponse.setError("confirm", "Поле обязательно для заполнения");
    const regularValidPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}/g;
    const validPass = regularValidPassword.test(password);
    if (_.isEqual(confirm, password) == false) apiResponse.setError("confirm", "Пароли не совпадают");
    if (!validPass)
      apiResponse.setError(
        "password",
        "Пароль должен содержать строчные, прописные буквы и цифры а так же быть не менее 6 и не более 12 символов длинной"
      );
  }

  static phoneFormat(phone: string): string {
    return phone.replace(/(\+7|8)[\s(]?(\d{3})[\s)]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g, "+7($2)$3-$4-$5");
  }

  static async candidate(login: string, apiResponse: ApiResponse) {
    const loginType = Validdata.loginTupe(login);
    const loginDefinition = loginType == "email" ? login : Validdata.phoneFormat(login);
    const errorMessage = loginType == "email" ? "почтовым адресом" : "номером телефона";
    const availability = await User.findOne({
      where: { [loginType]: loginDefinition },
    });
    if (availability)
      apiResponse.setError("login", `Пользователь с ${errorMessage} ${loginDefinition} уже зарегестрирован`);
  }
}
