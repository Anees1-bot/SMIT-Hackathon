const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not set');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const auth = req.headers['authorization'];
    if(!auth){
        return res.status(403).json({message: 'Unauthorized, JWT token is required'});
    }

    // Support both raw token and standard "Bearer <token>" formats
    const token = auth.startsWith('Bearer ')
        ? auth.slice('Bearer '.length).trim()
        : auth.trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({message: 'Unauthorized, Invalid JWT token or expired'});
    }
}
module.exports = ensureAuthenticated;
