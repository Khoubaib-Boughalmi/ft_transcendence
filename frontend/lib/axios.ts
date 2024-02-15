import axios from "axios";

const backendAPI = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
	withCredentials: true,
});

export default backendAPI;
