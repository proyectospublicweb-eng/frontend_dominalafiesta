import axios from "axios";

const instanceAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/apiproyectoeventos",
  withCredentials: true,
});

export default instanceAxios;
