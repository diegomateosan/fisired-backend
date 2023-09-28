class serviceResponse {
  constructor() {
    this.success = false;
    this.message = null;
    this.data = null;
    this.statusCode = 200;
  }

  setSucessResponse(message, data) {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  setErrorResponse(message, code) {
    this.success = false;
    this.message = message;
    this.statusCode = code;
    this.data = null;
  }
}

module.exports = serviceResponse;
