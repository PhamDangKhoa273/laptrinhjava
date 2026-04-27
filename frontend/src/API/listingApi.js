import axios from "axios";

const API = "http://localhost:8080/api/listings";

export const getProducts = () => axios.get(API);
export const getProduct = (id) => axios.get(`${API}/${id}`);