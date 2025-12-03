import axios from 'axios';
import { Generator, CreateGeneratorRequest, UpdateGeneratorRequest, GenHistory, GenerateFromGeneratorRequest, GenerateFromGeneratorResponse, GenModel } from '@/types/generator';

export const getGenerators = async (workspaceId: string, pageNum: number, pageSize: number, query: string) => {
  const response = await axios.get<Generator[]>(
    `/api/v1/workspaces/${workspaceId}/generators?pageSize=${pageSize}&pageNumber=${pageNum}&query=${query}`,
    { withCredentials: true }
  );
  return response.data;
};

export const getGenerator = async (workspaceId: string, generatorId: string) => {
  const response = await axios.get<Generator>(
    `/api/v1/workspaces/${workspaceId}/generators/${generatorId}`,
    { withCredentials: true }
  );
  return response.data;
};

export const createGenerator = async (workspaceId: string, data: CreateGeneratorRequest) => {
  const response = await axios.post<Generator>(
    `/api/v1/workspaces/${workspaceId}/generators`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const updateGenerator = async (workspaceId: string, generatorId: string, data: UpdateGeneratorRequest) => {
  const response = await axios.put<Generator>(
    `/api/v1/workspaces/${workspaceId}/generators/${generatorId}`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const deleteGenerator = async (workspaceId: string, generatorId: string) => {
  const response = await axios.delete(
    `/api/v1/workspaces/${workspaceId}/generators/${generatorId}`,
    { withCredentials: true }
  );
  return response.data;
};

export const generateFromGenerator = async (workspaceId: string, data: GenerateFromGeneratorRequest) => {
  const response = await axios.post<GenerateFromGeneratorResponse>(
    `/api/v1/workspaces/${workspaceId}/generators/generate`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const getGenHistories = async (workspaceId: string, pageNum: number, pageSize: number, generatorId?: string) => {
  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
    pageNumber: pageNum.toString(),
  });
  if (generatorId) {
    params.append('generatorId', generatorId);
  }
  const response = await axios.get<GenHistory[]>(
    `/api/v1/workspaces/${workspaceId}/gen-history?${params.toString()}`,
    { withCredentials: true }
  );
  return response.data;
};

export const getGenHistory = async (workspaceId: string, historyId: string) => {
  const response = await axios.get<GenHistory>(
    `/api/v1/workspaces/${workspaceId}/gen-history/${historyId}`,
    { withCredentials: true }
  );
  return response.data;
};

export const deleteGenHistory = async (workspaceId: string, historyId: string) => {
  const response = await axios.delete(
    `/api/v1/workspaces/${workspaceId}/gen-history/${historyId}`,
    { withCredentials: true }
  );
  return response.data;
};

export const listGenModels = async (workspaceId: string) => {
  const response = await axios.get<GenModel[]>(
    `/api/v1/workspaces/${workspaceId}/gen-models`,
    { withCredentials: true }
  );
  return response.data;
};
