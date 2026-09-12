import { axiosClient } from './axiosClient';

export const fetchVillages = async ({ districtId, block, riskFilter, search }) => {
  const params = {};
  if (districtId) params.districtId = districtId;
  if (block && block !== 'ALL') params.block = block;
  if (riskFilter && riskFilter !== 'ALL') params.riskFilter = riskFilter;
  if (search) params.search = search;

  const res = await axiosClient.get('/villages', { params });
  return res.data;
};

export const fetchVillageById = async (villageId) => {
  const res = await axiosClient.get(`/villages/${villageId}`);
  return res.data;
};
