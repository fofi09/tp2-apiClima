import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import './index.css';

const API_WEATHER = `http://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_API_KEY}&lang=es&q=`;

export default function App() {
  const [city, setCity] = useState("");
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [connectedToMongoDB, setConnectedToMongoDB] = useState(false); // Nuevo estado

  // guardar en la base de datos
  const saveToDatabase = async () => {
    try {
      if (!weather) {
        throw new Error('No hay datos meteorológicos para guardar');
      }
  
      const response = await fetch('http://localhost:5000/saveWeatherData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: weather.city,
          temperature: weather.temperature
        }),
      });
  
      if (!response.ok) {
        throw new Error('No se pudo guardar en mongoDB');
      }
  
      console.log('Se guardo correctamente en mongoDB');
      setConnectedToMongoDB(true); // Actualiza el estado cuando se guarda correctamente
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError({ error: false, message: "" });
    setLoading(true);

    try {
      if (!city.trim()) throw { message: "Debe ingresar una ciudad" };

      const res = await fetch(API_WEATHER + city);
      if (!res.ok) {
        throw { message: "La ciudad no existe" };
      }
      const data = await res.json();

      if (data.error) {
        throw { message: data.error.message };
      }

      console.log(data);

      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.code,
        conditionText: data.current.condition.text,
        icon: data.current.condition.icon,
      });
    } catch (error) {
      console.log(error);
      setError({ error: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-color" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "3px" }}>
      <Container
        maxWidth="xs"
        sx={{
          mt: 2,
          border: "1px solid black",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "white"
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            animation: "HeartBeat 4s ease infinite",
            fontFamily: "Arial"
          }}
        >
          Api del clima
        </Typography>

        {connectedToMongoDB && ( // Mostrar mensaje si está conectado a MongoDB
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            gutterBottom
            sx={{ marginBottom: 1, fontWeight: "bold" }}
          >
            Ciudad guardada en mongo DB
          </Typography>
        )}

        <Box
          sx={{ display: "grid", gap: 2 }}
          component="form"
          autoComplete="off"
          onSubmit={onSubmit}
        >
          <TextField
            id="city"
            label="localidad o region"
            variant="outlined"
            size="small"
            fullWidth
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={error.error}
            helperText={error.message}
            sx={{
              color: "black",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "black" },
              "&:hover fieldset": {
                borderColor: "black"
              }
            }}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            loadingIndicator="Buscando..."
            sx={{
              color: "black",
              borderColor: "black",
              backgroundColor: "grey",
              "&:hover": {
                backgroundColor: "gray"
              }
            }}
          >
            Buscar Ubicacion
          </LoadingButton>
          
          {/* Botón para guardar en MongoDB */}
          <LoadingButton
            onClick={saveToDatabase} 
            variant="contained"
            sx={{
              color: "black",
              borderColor: "black",
              backgroundColor: "grey",
              "&:hover": {
                backgroundColor: "gray"
              }
            }}
          >
            Guardar en mongo DB
          </LoadingButton>

        </Box>

        {weather && (
          <div
            className="cardContainer"
            style={{
              display: "flex",
              maxWidth: "359px",
              margin: "auto",
              textAlign: "center",
              textAlignLast: "center",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <div className="card">
              <p className="city">
                {weather.city}, {weather.country}
              </p>
              <p className="weather">{weather.conditionText}</p>
              <img
                className="weather"
                alt={weather.conditionText}
                src={weather.icon}
                style={{ width: "100px", height: "75px" }}
              />
              <p className="temp">{weather.temperature} °C</p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
