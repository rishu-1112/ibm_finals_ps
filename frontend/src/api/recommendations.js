import { axiosClient } from './axiosClient';

export const fetchRecommendations = async (villageId) => {
  const params = {};
  if (villageId) params.villageId = villageId;

  const res = await axiosClient.get('/recommendations', { params });
  return res;
};
