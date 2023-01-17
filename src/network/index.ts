// import {API_URL} from '@env';
import axios, {AxiosInstance} from 'axios';

const API_URL='https://custom-pneumatic-web-dev.herokuapp.com';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  timeoutErrorMessage: 'Service unavailable',
});
