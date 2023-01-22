import ApiError from '../exception/ApiError.js';

export default function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message, errors: err.errors });
  }
  return res.status(500).json({ success: false, message: 'Oops' });
}
