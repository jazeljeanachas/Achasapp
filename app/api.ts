import axios from 'axios';

const api = axios.create({
  baseURL: 'https://achasapp.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;