import { verifyToken } from "../../../utils/jwt";

export default function handler(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ message: "Invalid token" });
  }

  // Přístup povolen
  res.status(200).json({ message: "Access granted", user });
}
