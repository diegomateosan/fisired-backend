class ServiceResponse {
  constructor () {
    this.success = false
    this.message = null
    this.data = null
    this.statusCode = 200
  }

  setSucessResponse (message, data, code) {
    this.success = true
    this.message = message
    this.data = data
    this.statusCode = code
  }

  setErrorResponse (message, code) {
    this.success = false
    this.message = message
    this.statusCode = code
    this.data = null
  }
}

module.exports = ServiceResponse
