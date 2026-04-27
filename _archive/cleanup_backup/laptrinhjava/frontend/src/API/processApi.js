import axios from "axios";

const API = "http://localhost:8080/api/process";

export const getSteps = (seasonId) =>
  axios.get(`${API}/season/${seasonId}`);

export const createStep = (data) =>
  axios.post(API, data);