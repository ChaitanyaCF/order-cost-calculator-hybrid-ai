import axios from 'axios';

const API_URL = '/api/auth';

interface LoginResponse {
  id: number;
  username: string;
  isAdmin: boolean;
  token: string;
}

interface RegisterResponse {
  message: string;
}

class AuthService {
  async login(username: string, password: string) {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
        username,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        id: response.data.id,
        username: response.data.username,
        isAdmin: response.data.isAdmin
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error occurred during login');
    }
  }

  async register(username: string, password: string, email?: string) {
    try {
      const response = await axios.post<RegisterResponse>(`${API_URL}/register`, {
        username,
        password,
        email
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error occurred during registration');
    }
  }
}

export default new AuthService();