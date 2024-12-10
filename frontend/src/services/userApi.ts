import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UserApiRequest {
  email: string;
  password?: string;
  role: string;
  first_name: string;
  last_name: string;
}

export const createUser = async (userData: User): Promise<ApiResponse<User>> => {
  try {
    const requestData: UserApiRequest = {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName
    };
    const response = await axios.post<ApiResponse<User>>(`${API_BASE_URL}/signup`, requestData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create user');
  }
};

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await axios.get<ApiResponse<User[]>>(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch users');
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const requestData: Partial<UserApiRequest> = {
      email: userData.email,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
      password: userData.password
    };
    const response = await axios.put<ApiResponse<User>>(`${API_BASE_URL}/users/${userId}`, requestData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update user');
  }
};

export const deleteUser = async (userId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete<ApiResponse<void>>(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to delete user');
  }
};
