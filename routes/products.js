import express from "express";
import pool from "../config/database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* OBTENER TODOS LOS PRODUCTOS */
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

/* OBTENER PRODUCTO POR ID */
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener producto" });
    }
});

/* CREAR PRODUCTO (ADMIN) */
router.post("/", auth(["admin"]), async (req, res) => {
    try {
        const { name, price, stock, image_url } = req.body;

        // Validaciones básicas
        if (!name || !price) {
            return res.status(400).json({ error: "Nombre y precio son requeridos" });
        }

        const result = await pool.query(
            `INSERT INTO products (name, price, stock, image_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, price, stock || 0, image_url || null]
        );

        res.status(201).json({
            message: "Producto creado exitosamente",
            product: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

/* EDITAR PRODUCTO (ADMIN) */
router.put("/:id", auth(["admin"]), async (req, res) => {
    try {
        const { name, price, stock, image_url } = req.body;

        // Validar que el producto existe
        const productCheck = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [req.params.id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const result = await pool.query(
            `UPDATE products
             SET name = $1,
                 price = $2,
                 stock = $3,
                 image_url = $4
             WHERE id = $5
             RETURNING *`,
            [name, price, stock, image_url, req.params.id]
        );

        res.json({
            message: "Producto actualizado exitosamente",
            product: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al editar producto" });
    }
});

/* ACTUALIZAR STOCK (ADMIN) */
router.patch("/:id/stock", auth(["admin"]), async (req, res) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            return res.status(400).json({ error: "Stock es requerido" });
        }

        const result = await pool.query(
            `UPDATE products 
             SET stock = $1 
             WHERE id = $2 
             RETURNING *`,
            [stock, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({
            message: "Stock actualizado exitosamente",
            product: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar stock" });
    }
});

/* ELIMINAR PRODUCTO (ADMIN) */
router.delete("/:id", auth(["admin"]), async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ 
            message: "Producto eliminado exitosamente",
            deletedProduct: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

export default router;