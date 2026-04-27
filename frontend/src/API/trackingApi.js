import axios from "axios";

export const getTracking = (id) =>
  axios.get(`http://localhost:8080/api/tracking/${id}`);