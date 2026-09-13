export function notFound(
  req,
  res
) {
  res.status(404).json({
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  error,
  req,
  res,
  next
) {
  const responseData =
    error.response?.data;

  const status =
    error.response?.status;

  console.error(
    "API Error:",
    responseData ||
      error.message
  );

  /*
    Watchmode rate limit / quota error
  */
  if (status === 429) {
    const watchmodeMessage =
      String(
        responseData?.errorMessage ||
        responseData?.message ||
        ""
      );

    const quotaExceeded =
      /quota|over plan quota/i.test(
        watchmodeMessage
      );

    return res.status(429).json({
      message: quotaExceeded
        ? "Watchmode API quota has been exhausted for this API key. Please use an available API key or wait for the quota to reset."
        : "Watchmode API rate limit reached. Please wait a moment and try again.",
    });
  }

  /*
    Invalid / missing API key
  */
  if (status === 401) {
    return res.status(401).json({
      message:
        "Watchmode API key is invalid or missing.",
    });
  }

  /*
    Movie not found
  */
  if (status === 404) {
    return res.status(404).json({
      message:
        "Movie not found.",
    });
  }

  /*
    Watchmode may return either:
      errorMessage
    or:
      message
  */
  const upstreamMessage =
    responseData?.errorMessage ||
    responseData?.message;

  if (upstreamMessage) {
    return res.status(
      Number.isInteger(status)
        ? status
        : 500
    ).json({
      message:
        upstreamMessage,
    });
  }

  /*
    Normal JavaScript / Axios error
  */
  if (error.message) {
    return res.status(500).json({
      message:
        error.message,
    });
  }

  /*
    Final fallback
  */
  return res.status(500).json({
    message:
      "Internal server error.",
  });
}