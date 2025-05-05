import axios from 'axios';
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://invoicesimulation.onrender.com/api' });
export default API;