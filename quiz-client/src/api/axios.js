import axios from 'axios';

// The ASP.NET Core backend is running on port 5007
const instance = axios.create({
  baseURL: 'http://localhost:5007',
  withCredentials: true, // Important for cookie-based auth
});

export default instance;
