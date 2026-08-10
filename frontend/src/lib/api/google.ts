import api from '../axios';

export interface GoogleContact {
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
}

export const connectGoogle = async (code: string) => {
  const response = await api.post('/google/connect', { code });
  return response.data;
};

export const fetchGoogleContacts = async (): Promise<GoogleContact[]> => {
  const response = await api.get('/google/contacts');
  return response.data.contacts;
};

export const disconnectGoogle = async () => {
  const response = await api.delete('/google/disconnect');
  return response.data;
};
