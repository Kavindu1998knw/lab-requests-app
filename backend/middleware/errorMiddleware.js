export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: 'Validation Error', errors: messages });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json({ message: `A record with this ${field} already exists.` });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ message: `Invalid format for field: ${err.path}` });
    return;
  }

  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
  });
};
