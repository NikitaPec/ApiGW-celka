interface errors {
  [index: string]: Array<string>;
}
interface data {
  [index: string]: string | boolean;
}
export default class ApiResponse {
  success = true;
  data: data = {};
  errors: errors = {};

  constructor(data = {}) {
    this.data = data;
  }
  setError(name: string, message: string) {
    Object.keys(this.errors).includes(name) ? this.errors[name].push(message) : (this.errors[name] = [message]);
    for (const key in this.errors) {
      if (this.errors[key].length > 0) {
        this.success = false;
        this.data = {};
      }
    }
  }

  static setData(data?: object) {
    return new ApiResponse(data);
  }

  addData(data: object) {
    Object.assign(this.data, data);
  }

  isSuccess() {
    for (const key in this.errors) {
      if (this.errors[key].length > 0) {
        this.success = false;
      }
    }
    return this.success;
  }
}
