export default class UserDto {
  email;
  phone;
  id;
  isActivated;
  name;
  role;

  constructor(model) {
    this.phone = model.phone;
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.name = model.name;
    this.role = model.role;
  }
}
