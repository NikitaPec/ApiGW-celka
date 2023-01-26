export default class ApiResponse {
    success: false;
    errors: [];
    data: null;

    hasErrors() {
        return this.errors.length > 0
    };

    setError(message) {
        this.errors.push(message)
    };

    setErrors(errors) {
        this.errors = [...this.errors, errors]
    };
}
