import _ from "lodash";
import ApiResponse from "../dto/ApiResponseDto.js";
import User from "../User/model/UserModel.js";

class Validdata {
  loginType(login: string) {
    return login.indexOf("@") >= 0 ? "email" : "phone";
  }
  checkLogin(login: string, response: ApiResponse, loginType?: string | undefined) {
    if (login == "") {
      response.setError("login", "Поле обязательно для заполнения");
    } else {
      if (loginType == undefined) {
        loginType = this.loginType(login);
      }
      //const loginType = this.loginType(login);
      switch (loginType) {
        case "email":
          const regularValidMail = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
          const validMail = regularValidMail.test(login);
          if (!validMail) {
            response.setError("login", "Некорректный адрес электронной почты");
            response.setError("email", "Некорректный адрес электронной почты");
          }
          break;
        case "phone":
          const regularValidPhone = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
          const validPhone = regularValidPhone.test(this.phoneFormat(login));
          if (!validPhone) {
            response.setError("login", "Некорректный номер телефона");
            response.setError("phone", "Некорректный номер телефона");
          }
          break;
        default:
      }
    }
  }
  checkPassword(password: string, confirm: string, apiResponse: ApiResponse) {
    if (password == "") apiResponse.setError("password", "Поле обязательно для заполнения");
    if (confirm == "") apiResponse.setError("confirm", "Поле обязательно для заполнения");
    const regularValidPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,12}/g;
    const validPass = regularValidPassword.test(password);
    if (_.isEqual(confirm, password) == false)
      apiResponse.setError("confirm", "Пароли не совпадают");
    if (!validPass)
      apiResponse.setError("password", "Строчные и прописные буквы, цифры. От 6 до 12 символов");
  }

  phoneFormat(phone: string): string {
    return phone.replace(
      /(\+7|8)[\s(]?(\d{3})[\s)]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})/g,
      "+7($2)$3-$4-$5"
    );
  }

  async candidate(login: string, apiResponse?: ApiResponse, method?: string): Promise<User | null> {
    //При method == "check" (ошибка если существует)
    //При method == "search" (ошибка если не существует)
    //Без метода и класса ApiResponse возвращяет user: User | null
    const loginType = this.loginType(login);
    const loginDefinition = loginType == "email" ? login : this.phoneFormat(login);
    const user = await User.findOne({
      where: { [loginType]: loginDefinition },
    });

    if (apiResponse) {
      const errorMessageType = loginType == "email" ? "почтовым адресом" : "номером телефона";
      const errorMessageMethod = method == "check" ? "уже зарегестрирован" : "не существует";
      if (user && method == "check") {
        apiResponse.setError(
          loginType,
          `Пользователь с ${errorMessageType} ${loginDefinition} ${errorMessageMethod}.`
        );
        apiResponse.setError(
          "login",
          `Пользователь с ${errorMessageType} ${loginDefinition} ${errorMessageMethod}.`
        );
      }
      if (user == null && method == "search") {
        apiResponse.setError(
          loginType,
          `Пользователь с ${errorMessageType} ${loginDefinition} ${errorMessageMethod}.`
        );
        apiResponse.setError(
          "login",
          `Пользователь с ${errorMessageType} ${loginDefinition} ${errorMessageMethod}.`
        );
      }
    }
    return user;
  }
}

export default new Validdata();
