// An error that carries an HTTP status code, so controllers can
// `throw new AppError('Not found', 404)` and the error middleware
// turns it into the right response.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
