import { axiosClient } from './axiosClient';

export const fetchPriorities = async (districtId, filter) => {
  const params = {};
  if (districtId) params.districtId = districtId;
  if (filter && filter !== 'ALL') params.filter = filter;

  const res = await axiosClient.get('/priorities', { params });
  return res.data;
};
