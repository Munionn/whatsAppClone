export class ApiError extends Error {
    status: number;
    errors: any[];

    constructor(status: number, message: string ,errors: any[]) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(): ApiError {
        return new ApiError(401, 'User doesnt authorized', [401, 'Not authorized']);
    }

    static BadRequest(message: string, errors: any[] = []): ApiError {
        return new ApiError(400, message, errors);
    }
}