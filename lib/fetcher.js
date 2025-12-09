import { apiInstance } from "./api";

export const getFetch = async (url) => {
  const response = await apiInstance.get(url);
  return response.data;
};

export const postFetch = async (url, body) => {
  const response = await apiInstance.post(url, body);
  return response.data;
};

export const putFetch = async (url, body) => {
  const response = await apiInstance.put(url, body);
  return response.data;
};

export const patchFetch = async (url, body) => {
  const response = await apiInstance.patch(url, body);
  return response.data;
};

export const deleteFetch = async (url) => {
  const response = await apiInstance.delete(url);
  return response.data;
};

export const uploadProfilePicture = async (formData) => {
  const response = await apiInstance.patch(
    '/user/profile/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
