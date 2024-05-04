class ApiResponse {
    constructor(statusCode, data, message) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400
    }
}

export { ApiResponse };

// we have defined "< 400" because all responses with status codes above 400 represent errors
// this file only handles truthy responses