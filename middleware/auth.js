// middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(roles = []) {
    return (req, res, next) => {
        console.log(" MIDDLEWARE AUTH INICIADO ");
        console.log(" Ruta:", req.path);
        console.log(" Método:", req.method);
        console.log(" Header Authorization completo:", req.headers.authorization);
        console.log(" Roles requeridos para esta ruta:", roles);

        // Extraer el token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log(" ERROR: Header Authorization no presente");
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log(" ERROR: Token no encontrado en el header");
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        console.log(" Token extraído correctamente");
        console.log(" Token (primeros 20 chars):", token.substring(0, 20) + "...");

        try {
            console.log(" Intentando verificar token con JWT_SECRET...");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            console.log(" Token verificado correctamente");
            console.log(" Usuario decodificado:", {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            });
            
            req.user = decoded;

            // Verificar roles si se especificaron
            if (roles.length > 0) {
                console.log(" Verificando roles...");
                console.log(" Rol del usuario:", decoded.role);
                console.log(" Roles permitidos:", roles);
                console.log(" ¿Tiene acceso?", roles.includes(decoded.role));
                
                if (!roles.includes(decoded.role)) {
                    console.log(" ERROR: Rol no autorizado");
                    console.log(" Usuario con rol '" + decoded.role + "' no tiene acceso a esta ruta");
                    return res.status(403).json({ 
                        error: "No autorizado",
                        details: `Se requiere uno de estos roles: ${roles.join(', ')}` 
                    });
                }
                
                console.log("Rol autorizado");
            } else {
                console.log("  No se requieren roles específicos para esta ruta");
            }

            console.log(" ACCESO AUTORIZADO - Pasando al siguiente middleware/controlador");
            next();
            
        } catch (err) {
            console.log(" ERROR: Token inválido o expirado");
            console.log(" Error details:", err.message);
            console.log(" Error name:", err.name);
            
            if (err.name === 'TokenExpiredError') {
                console.log(" El token ha expirado");
                return res.status(401).json({ error: "Token expirado" });
            } else if (err.name === 'JsonWebTokenError') {
                console.log(" Error en la estructura del token");
                return res.status(401).json({ error: "Token inválido" });
            } else {
                console.log(" Error desconocido en verificación de token");
                return res.status(401).json({ error: "Token inválido" });
            }
        }
    };
}