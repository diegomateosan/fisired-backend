const createCustomError = (message, code = 500) => {
  const customError = new Error(message)
  customError.code = code
  return customError
}

module.exports = {
  createCustomError
}
