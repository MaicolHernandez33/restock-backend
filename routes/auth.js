import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Error en el login" });
    }
});

// Registrar usuario normal
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id, email, role",
            [email, hashed]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

export default router;
