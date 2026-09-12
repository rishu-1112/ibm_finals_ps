import { axiosClient } from './axiosClient';

export const fetchTrends = async (indicator) => {
  const params = {};
  if (indicator) params.indicator = indicator;

  const res = await axiosClient.get('/trends', { params });
  return res.data;
};
