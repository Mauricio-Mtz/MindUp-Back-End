const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors()); // Habilitar CORS
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/crud', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Definir el esquema de Producto
const productoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
});

// Crear el modelo de Producto
const Producto = mongoose.model('Productos', productoSchema);

// Crear el CRUD

// 1. Obtener todos los productos (GET)
app.get("/products", async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los productos", error });
    }
});

// 2. Crear un nuevo producto (POST)
app.post("/products", async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "El nombre y el precio son obligatorios" });
    }

    try {
        const nuevoProducto = new Producto({ name, price });
        const productoGuardado = await nuevoProducto.save();  // Guardar en MongoDB
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el producto", error });
    }
});

// 3. Actualizar un producto (PUT)
app.put("/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    try {
        const productoActualizado = await Producto.findByIdAndUpdate(id, { name, price }, { new: true });

        if (!productoActualizado) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el producto", error });
    }
});

// 4. Eliminar un producto (DELETE)
app.delete("/products/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const productoEliminado = await Producto.findByIdAndDelete(id);

        if (!productoEliminado) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto", error });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});
