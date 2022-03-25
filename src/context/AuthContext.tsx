import React from 'react';
import noop from 'noop-ts';
import copyToClipboard from 'copy-to-clipboard';

import { Connector, useAuth } from 'clients/web3';
import toast from 'components/Basic/Toast';
import { AuthModal } from 'components/v2/AuthModal';

// eslint-disable-next-line no-spaced-func
export const AuthContext = React.createContext<{
  account?: string;
  login: (connector: Connector) => Promise<void>;
  logOut: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}>({
  login: noop,
  logOut: noop,
  openAuthModal: noop,
  closeAuthModal: noop,
});

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const { login, account, logOut } = useAuth();

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleLogin = (connector: Connector) => {
    login(connector);
    closeAuthModal();
  };

  const handleCopyAccountAddress = (accountAddress: string) => {
    copyToClipboard(accountAddress);

    toast.success({
      title: 'Wallet address copied to clipboard',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        account: account ?? undefined,
        login,
        logOut,
        openAuthModal,
        closeAuthModal,
      }}
    >
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        account={
          account
            ? {
                address: account,
                // TODO: check how we can get connector name
                connector: Connector.MetaMask,
              }
            : undefined
        }
        onLogOut={logOut}
        onLogin={handleLogin}
        onCopyAccountAddress={handleCopyAccountAddress}
      />

      {children}
    </AuthContext.Provider>
  );
};