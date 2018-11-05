export default function returnNullIfFunctionThrows404(fn: Function) {
  return (...args) => {
    try {
      return fn(...args);
    }
    catch (error) {
      if (error && error.response && error.response.statusCode === 404) {
        return null;
      }
      throw error;
    }
  };
}