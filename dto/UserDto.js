export default class UserDto {
  email;
  phone;
  id;
  isActivatedEmail;
  isActivatedPhone;
  name;
  role;

  constructor(model) {
    this.phone = model.phone;
    this.email = model.email;
    this.id = model.id;
    this.isActivatedEmail = model.isActivatedEmail;
    this.isActivatedPhone = model.isActivatedPhone;
    this.name = model.name;
    this.role = model.role;
  }
}
