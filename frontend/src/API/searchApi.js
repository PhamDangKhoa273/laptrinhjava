import axios from "axios";

export const searchProducts = (keyword) =>
  axios.get(`http://localhost:8080/api/search?q=${keyword}`);