class ApiError {
    constructor(status, message) {
        this.success = false;
        this.status = status;
        this.message = message;
    }
}

export default ApiError;