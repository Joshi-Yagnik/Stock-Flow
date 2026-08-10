import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export interface GoogleContact {
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
}

export const useGoogleContacts = () => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const fetchContactsWithToken = async (accessToken: string) => {
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
        const errorText = await response.text();
        console.error("Google People API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
           setIsExpired(true);
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
      })).filter((c: GoogleContact) => c.name); // only keep if it has a name

      setContacts(parsedContacts);
      setIsConnected(true);
      setIsExpired(false);
      toast.success("Google Contacts loaded!");
    } catch (err) {
      toast.error("Failed to fetch Google Contacts.");
      setIsConnected(false);
    } finally {
      setIsLoadingContacts(false);
      setIsConnecting(false);
    }
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/contacts.readonly',
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
          fetchContactsWithToken(tokenResponse.access_token);
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
    isDisconnecting: false,
    refetch: () => {} 
  };
};
