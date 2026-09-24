import axios from 'axios';


const IP_DE_TU_PC = '192.168.1.79';

const getBaseURL = () => {
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
