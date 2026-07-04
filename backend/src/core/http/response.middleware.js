export function responseEnvelope(_req, res, next) {
  res.ok = (data, status = 200) => {
    res.status(status).json({ success: true, data });
  };
  res.created = (data) => {
    res.status(201).json({ success: true, data });
  };
  res.noContent = () => {
    res.status(204).send();
  };
  next();
}
