import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  // Support both cookie and Authorization header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", err: err.message });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireWarehouseManager = requireRole("admin", "warehouseManager");
export const requireSupplier = requireRole("admin", "supplier");
export const requireSalesRep = requireRole("admin", "salesRepresentative");
