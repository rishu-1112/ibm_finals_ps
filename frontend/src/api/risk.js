import { axiosClient } from './axiosClient';

export const fetchAIRiskPredictions = async (villageId) => {
  const params = {};
  if (villageId) params.villageId = villageId;

  const res = await axiosClient.get('/risk-predictions', { params });
  return res;
};
