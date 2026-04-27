import axios from "axios";

const API = "http://localhost:8080/api/seasons";

export const getSeasons = () => axios.get(API);
export const createSeason = (data) => axios.post(API, data);
export const updateSeason = (id, data) => axios.put(`${API}/${id}`, data);
export const getSeasonById = (id) => axios.get(`${API}/${id}`);