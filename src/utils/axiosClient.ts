import axios from 'axios';

axios.defaults.withCredentials = true;

const handleSuccess = (response) => {
  return response;
};

const handleError = (error) => {
  switch (error.response.status) {
  }
  return Promise.reject(error);
};

const redirectTo = (document, path) => {
  document.location = path;
};

export function axiosClient(headers) {
  const axiosClient = axios.create({
    headers: headers,
  });
  axiosClient.interceptors.response.use(handleSuccess, handleError);
  return axiosClient;
}
