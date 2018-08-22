export class Exception extends Error {
  constructor(message, error_code) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.error_code = error_code;
  }
}
