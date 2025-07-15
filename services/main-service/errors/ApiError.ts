class ApiError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    /**
     * Custom API Error Class
     * @param statusCode HTTP status code
     * @param message Error message
     * @param isOperational Is this a known operational error? (default: true)
     * @param details Additional error details
     */
    constructor(
        statusCode: number,
        message: string,
        isOperational: boolean = true,
        details?: any
    ) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        // Maintain proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        // Set the prototype explicitly (needed when extending built-ins)
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    // Predefined common errors
    static badRequest(message: string, details?: any) {
        return new ApiError(400, message, true, details);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message: string = 'Not Found') {
        return new ApiError(404, message);
    }

    static internal(message: string = 'Internal Server Error', details?: any) {
        return new ApiError(500, message, false, details);
    }
}

export default ApiError;