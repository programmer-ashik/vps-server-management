export function notFoundHandler(_req, res, _next) {
  res
    .status(404)
    .json({ success: false, code: "NOT_FOUND", message: "Route not found" });
}
