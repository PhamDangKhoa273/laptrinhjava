import axios from "axios";

const API = "http://localhost:8080/api/batch";

export const createBatch = (data) => axios.post(API, data);
export const getBatches = () => axios.get(API);
export const getBatch = (id) => axios.get(`${API}/${id}`);