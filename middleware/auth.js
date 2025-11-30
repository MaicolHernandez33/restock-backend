// middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(roles = []) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Token no proporcionado" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: "No autorizado" });
            }

            next();
        } catch (err) {
            res.status(401).json({ error: "Token inválido" });
        }
    };
}
