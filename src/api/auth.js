import instanceAxios from "./axios.js";

export const registerRequest = (user) => instanceAxios.post("/register", user);

export const loginRequest = (user) => instanceAxios.post("/login", user);

export const verifyTokenRequest = () => instanceAxios.get("/verify");

export const logoutRequest = () => instanceAxios.post("/logout");
