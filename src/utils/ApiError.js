// Custom error class for API-related errors
class ApiError extends Error {
  constructor(
      statusCode,
      message="Something went wrong",
      errors=[],
      stack=""
  ){
      // Call the parent Error constructor with the provided message
      super(message)

      // Set the HTTP status code for the error
      this.statusCode = statusCode

      // Initialize the data property as null
      this.data = null

      // Set the error message
      this.message = message

      // Set the success flag to false, indicating an error occurred
      this.success = false

      // Store any additional error details in an array
      this.errors = errors

      // If a stack trace is provided, use it
      if (stack) {
          this.stack = stack
      }
      // Otherwise, capture the stack trace for this error
      else {
          Error.captureStackTrace(this, this.constructor)
      }
  }
}

// Export the ApiError class for use in other modules
export { ApiError }