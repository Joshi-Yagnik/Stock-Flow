import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export interface GoogleContact {
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
}

const STORAGE_KEY_TOKEN = "stockflow_google_access_token";
const STORAGE_KEY_TIME = "stockflow_google_token_time";

export const useGoogleContacts = () => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const fetchContactsWithToken = async (accessToken: string, showToast = true) => {
    setIsLoadingContacts(true);
    try {
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=1000",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setIsExpired(true);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_TIME);
        }
        throw new Error("Failed to fetch Google Contacts");
      }

      const data = await response.json();
      const connections = data.connections || [];
      
      const parsedContacts: GoogleContact[] = connections.map((person: any) => ({
        name: person.names?.[0]?.displayName || "",
        email: person.emailAddresses?.[0]?.value || "",
        phone: person.phoneNumbers?.[0]?.value || "",
        photo: person.photos?.[0]?.url || "",
      })).filter((c: GoogleContact) => c.name);

      setContacts(parsedContacts);
      setIsConnected(true);
      setIsExpired(false);

      // Save token locally
      localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEY_TIME, Date.now().toString());

      if (showToast) {
        toast.success("Google Contacts loaded!");
      }
    } catch (err) {
      if (showToast) {
        toast.error("Failed to fetch Google Contacts.");
      }
      setIsConnected(false);
    } finally {
      setIsLoadingContacts(false);
      setIsConnecting(false);
    }
  };

  // Check connection status on load WITHOUT calling Google API synchronously on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const savedTime = localStorage.getItem(STORAGE_KEY_TIME);

    if (savedToken && savedTime) {
      const elapsed = Date.now() - parseInt(savedTime, 10);
      if (elapsed < 3500000) {
        setIsConnected(true);
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    }
  }, []);

  const loadContacts = async () => {
    if (contacts.length > 0) return;
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (savedToken) {
      await fetchContactsWithToken(savedToken, false);
    }
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/contacts.readonly',
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        fetchContactsWithToken(tokenResponse.access_token, true);
      } else {
        console.error("No access token returned from Google:", tokenResponse);
        toast.error("Failed to get access token from Google");
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      toast.error('Google Contacts permission was not granted.');
      setIsConnecting(false);
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    login();
  };

  const handleDisconnect = () => {
    setContacts([]);
    setIsConnected(false);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TIME);
    toast.success("Google Contacts disconnected");
  };

  return {
    contacts,
    isLoadingContacts,
    isConnected,
    isExpired,
    isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
    loadContacts,
    isDisconnecting: false,
    refetch: () => {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedToken) fetchContactsWithToken(savedToken, false);
    }
  };
};
