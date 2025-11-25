import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export function apiClient(token){
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
}