const { verify } = require('jsonwebtoken');

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from the Authorization header

    if (!token) {
        return res.status(403).json({ error: "Access Denied: No token provided" });
    }

    try {
        const verified = verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the token
        req.user = verified; // Attach the user data to the request object
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = { authenticateToken };
