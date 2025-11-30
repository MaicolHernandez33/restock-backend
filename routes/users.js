import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get("/", auth(["admin"]), async (req, res) => {
    try {
        const result = await pool.query("SELECT id, email, role FROM users ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Crear usuario desde admin
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
