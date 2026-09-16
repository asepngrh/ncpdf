/**
 * Generic Web Worker for ncpdf client-side operations.
 */
self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "ECHO":
        // Validation / echo test
        self.postMessage({ id, status: "SUCCESS", result: payload });
        break;

      default:
        self.postMessage({
          id,
          status: "ERROR",
          error: `Unknown worker action type: ${type}`,
        });
        break;
    }
  } catch (err) {
    self.postMessage({
      id,
      status: "ERROR",
      error: err.message || "Worker processing error",
    });
  }
};
