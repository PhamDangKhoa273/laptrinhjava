import axios from "axios";

const API = "http://localhost:8080/api/orders";

export const createOrder = (data) => axios.post(API, data);
export const getOrders = () => axios.get(API);