/**
 * Http Error Class that is used to notify the client that there is
 * an error with their API requests
 *
 * @extends {Error}
 * @implements {Log}
 */
class HttpError extends Error {
  /** @type {number} */
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
  log() {
    console.log(`Http error ${this.statusCode}: ${this.message}`);
  }
}
