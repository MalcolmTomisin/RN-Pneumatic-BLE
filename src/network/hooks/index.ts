import {useQuery} from '@tanstack/react-query';
import {axiosInstance} from '..';
import {useAppAuth} from 'src/store';

const fetchUserDetails = () =>
  axiosInstance.get('/api/profile', {
    headers: {
      Authorization: `Bearer ${useAppAuth.getState().token}`,
    },
  });

export const useUserDetails = () =>
  useQuery(['GET USER PROFILE'], fetchUserDetails);
