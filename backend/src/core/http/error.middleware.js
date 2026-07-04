import { logger } from "../logging/logger.js";
import { HttpError } from "./error.types.js";

export function errorHandler(error, req, res, _next) {
  const requestId = res.locals?.requestId;
  const clientIp = res.locals?.clientIp;

  if (req.timedout && !res.headersSent) {
    res.status(408).json({
      success: false,
      code: "REQUEST_TIMEOUT",
      message: "Request timed out",
      requestId,
      clientIp,
    });
    return;
  }

  const logMeta = {
    method: req.method,
    url: req.originalUrl,
    requestId,
    clientIp,
  };
  if (error instanceof Error) {
    logger.error(error.message, { ...logMeta, stack: error.stack });
  } else {
    logger.error("Unknown error", { ...logMeta, error });
  }

  if (error instanceof HttpError) {
    const payload = {
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
      clientIp,
    };
    res.status(error.status).json(payload);
    return;
  }

  const anyErr = error;

  if (anyErr?.name === "CastError") {
    res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: `Invalid ${anyErr.path}: ${anyErr.value}.`,
      requestId,
      clientIp,
    });
    return;
  }

  if (anyErr?.code === 11000) {
    res.status(409).json({
      success: false,
      code: "DUPLICATE_KEY",
      message: "Resource already exists.",
      requestId,
      clientIp,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Something went wrong";
  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message,
    requestId,
    clientIp,
  });
}
