import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get("/", auth(["admin"]), async (req, res) => {
    console.log(" INICIANDO GET /users ");
    
    try {
        console.log("1️ Ejecutando consulta SQL...");
        
        const result = await pool.query("SELECT id, email, role FROM users ORDER BY id");
        
        console.log("2️ Consulta exitosa");
        console.log(`3️ Usuarios encontrados: ${result.rows.length}`);
        console.log("4️ Datos:", JSON.stringify(result.rows, null, 2));
        
        res.json(result.rows);
        
        console.log("5️ Respuesta enviada al cliente");
        
    } catch (err) {
        console.error(" ERROR EN GET /users ");
        console.error("Error details:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        
        res.status(500).json({ 
            error: "Error al obtener usuarios",
            details: err.message 
        });
    }
});

// Los demás endpoints (POST, PUT, DELETE) permanecen igual...
router.post("/", auth(["admin"]), async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
            [email, hashed, role || "user"]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// Cambiar rol (solo admin)
router.put("/:id/role", auth(["admin"]), async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, email, role",
            [role, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar rol" });
    }
});

// Eliminar usuario (solo admin)
router.delete("/:id", auth(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query("DELETE FROM users WHERE id=$1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ success: true, message: "Usuario eliminado" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default router;