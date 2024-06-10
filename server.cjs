// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON en las solicitudes

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/Ciudades', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir un esquema para los datos del clima
const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
});

// Definir un modelo basado en el esquema
const Weather = mongoose.model('Weather', weatherSchema, 'clima-ciudad');

// Endpoint para guardar datos del clima
app.post('/saveWeatherData', async (req, res) => {
  try {
    const { city, temperature } = req.body;
    
    console.log('Datos recibidos en el servidor:', req.body); // <-- Agregar esta línea para imprimir el cuerpo de la solicitud
    
    // Crear una nueva instancia del modelo Weather
    const newWeather = new Weather({
      city,
      temperature,
    });

    // Guardar en la base de datos
    await newWeather.save();

    res.status(201).json({ message: 'Se guardo en mongo db' });
  } catch (error) {
    console.error('Hubo un error al conectar con mongo db:', error);
    res.status(500).json({ error: 'Error al guardar la ciudad en mongo DB' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`El servidor esta en el puerto ${PORT}`);
});
