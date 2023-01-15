import {API_URL} from '@env';
import axios, {AxiosInstance} from 'axios';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  timeoutErrorMessage: 'Service unavailable',
});
