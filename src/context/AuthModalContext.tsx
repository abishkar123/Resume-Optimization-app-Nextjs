'use client';

import { createContext, useContext, useState } from 'react';

interface AuthModalContextType {
  showSignupModal: boolean;
  openSignupModal: () => void;
  closeSignupModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  showSignupModal: false,
  openSignupModal: () => {},
  closeSignupModal: () => {},
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [showSignupModal, setShowSignupModal] = useState(false);
  return (
    <AuthModalContext.Provider
      value={{
        showSignupModal,
        openSignupModal: () => setShowSignupModal(true),
        closeSignupModal: () => setShowSignupModal(false),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);
