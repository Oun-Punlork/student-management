import jwt from "jsonwebtoken";

export const generatetoken = (userid, tokenVersion, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = { id: userid, tokenVersion };
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  return token;
};
