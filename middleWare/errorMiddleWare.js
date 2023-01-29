import ApiError from "../exception/ApiError.js";

export default function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json(err.response);
  }
  console.log(err);
  return res.status(500).json({ success: false, message: "Oops" });
}
