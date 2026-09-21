import axios from 'axios';
import { Platform } from 'react-native';

// Configura Axios apuntando a tu http://<IP-DE-TU-PC>:3000 según especificación del PDF
const IP_DE_TU_PC = '192.168.1.100';

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:3000`;
  } else if (Platform.OS === 'ios') {
    return `http://localhost:3000`;
  } else {
    return `http://${IP_DE_TU_PC}:3000`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
