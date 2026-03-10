const jwt = require("jsonwebtoken");

/**
 * Auth middleware
 * Expects: Authorization: Bearer <token>
 * Attaches: req.user = { id }
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format"
    });
  }

  const token = authHeader.split(" ")[1];

  if (process.env.NODE_ENV !== 'production') {
    // Log a short preview to avoid printing full token
    try {
      console.log('Auth middleware: token preview=', token ? `${token.slice(0, 10)}...` : 'none');
    } catch (e) {}
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.userId || decoded.sub || decoded.id
    };

    // In dev, keep the full decoded payload on the request for debugging
    if (process.env.NODE_ENV !== 'production') {
      req.decoded = decoded;
      console.log('Auth middleware: decoded token=', decoded);
    }

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};
