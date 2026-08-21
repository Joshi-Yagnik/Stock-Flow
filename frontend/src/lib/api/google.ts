import api from '../axios';

export interface GoogleContact {
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
}

export const syncGoogleTokens = async (accessToken: string, refreshToken?: string) => {
  const response = await api.post('/google/sync-tokens', { access_token: accessToken, refresh_token: refreshToken });
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
