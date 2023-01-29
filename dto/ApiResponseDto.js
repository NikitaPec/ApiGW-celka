export default class ApiResponse {
  success = true;
  data = {};
  errors = {};

  constructor(data = {}) {
    this.data = data;
  }
  setError(name, message) {
    Object.keys(this.errors).includes(name) ? this.errors[name].push(message) : (this.errors[name] = [message]);
    for (let key in this.errors) {
      if (this.errors[key].length > 0) {
        this.success = false;
        this.data = {};
      }
    }
  }

  static setData(data) {
    return new ApiResponse(data);
  }

  addData(data) {
    Object.assign(this.data, data);
  }

  isSuccess() {
    for (let key in this.errors) {
      if (this.errors[key].length > 0) {
        this.success = false;
      }
    }
    return this.success;
  }
}
