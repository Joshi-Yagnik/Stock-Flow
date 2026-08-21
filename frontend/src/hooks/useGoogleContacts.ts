import { useState } from 'react';
import { toast } from 'sonner';
import { fetchGoogleContacts, GoogleContact } from '@/lib/api/google';

export type { GoogleContact };

export const useGoogleContacts = () => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    setIsError(false);
    try {
      const data = await fetchGoogleContacts();
      setContacts(data);
    } catch (err: any) {
      console.error('Failed to load Google Contacts', err);
      setIsError(true);
      if (err.response?.status === 401 || err.response?.status === 404) {
        toast.error('Google Contacts access expired or not configured. Please sign in with Google again.');
      } else {
        toast.error('Failed to fetch Google Contacts.');
      }
    } finally {
      setIsLoadingContacts(false);
    }
  };

  return {
    contacts,
    isLoadingContacts,
    isError,
    loadContacts,
  };
};
