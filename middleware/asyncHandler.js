/*
 This method to catch errors in Async functions,
 the Async method is promise and return err if rejected, we catch this error
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
