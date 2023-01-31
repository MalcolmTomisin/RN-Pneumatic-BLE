// import {API_URL} from '@env';
import axios, {AxiosInstance} from 'axios';
import {API_URL} from '@env';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  timeoutErrorMessage: 'Service unavailable',
});
