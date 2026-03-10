import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findOne({ userId: decoded.userId }).select("-password")

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      }

      req.user = user
      return next()

    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" })
    }
  }

  return res.status(401).json({ success: false, message: "Not authorized, no token" })
}