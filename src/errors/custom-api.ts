class CustomAPIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name; // Set the error name to the class name
    this.statusCode = statusCode;      // Assign the status code to the property
    Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

export default CustomAPIError;
