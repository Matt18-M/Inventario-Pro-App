import axios from 'axios';

// ⚠️ Cambia esta IP si cambia la dirección IP de tu computadora en la red Wi-Fi
const IP_DE_TU_PC = '192.168.1.79';

const getBaseURL = () => {
  // Para conectar desde dispositivos físicos (como un iPhone o Android con Expo Go)
  // o emuladores a la red local, utilizamos la IP de tu PC:
  return `http://${IP_DE_TU_PC}:3000`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
