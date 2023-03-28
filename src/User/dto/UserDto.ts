interface model {
  email: string | null;
  phone: string | null;
  id: string | number;
  isActivatedEmail: boolean;
  isActivatedPhone: boolean;
  name: string;
  surname: string | null;
  patronymic: string | null;
  role: string;
}

export default class UserDto {
  email;
  phone;
  id;
  isActivatedEmail;
  isActivatedPhone;
  name;
  surname;
  patronymic;
  role;

  constructor(model: model) {
    this.phone = model.phone;
    this.email = model.email;
    this.id = String(model.id);
    this.isActivatedEmail = model.isActivatedEmail;
    this.isActivatedPhone = model.isActivatedPhone;
    this.name = model.name;
    this.surname = model.surname;
    this.patronymic = model.patronymic;
    this.role = model.role;
  }
}
