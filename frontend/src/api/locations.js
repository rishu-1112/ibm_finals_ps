import { axiosClient } from './axiosClient';

export const fetchLocations = async () => {
  const res = await axiosClient.get('/locations');
  return res.data;
};
