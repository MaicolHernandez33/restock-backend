import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import qrRoutes from "./routes/qr.js";

import { initDB } from "./models/initDB.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Inicializar BD
initDB();

// Rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/qr", qrRoutes);

app.listen(process.env.PORT, () =>
  console.log(` Servidor listo en http://localhost:${process.env.PORT}`)
);