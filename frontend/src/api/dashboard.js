import { axiosClient } from './axiosClient';

export const fetchDashboardMetrics = async (districtId, block) => {
  const params = {};
  if (districtId) params.districtId = districtId;
  if (block) params.block = block;

  const res = await axiosClient.get('/dashboard', { params });
  return res.data;
};
