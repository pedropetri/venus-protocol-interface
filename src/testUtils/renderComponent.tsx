import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { Web3Wrapper } from 'clients/web3';
import { AuthProvider } from 'context/AuthContext';
import { SuccessfulTransactionModalProvider } from 'context/SuccessfulTransactionModalContext';
import { init as initTranslationLibrary } from 'translation';
import Theme from 'theme';
import { RefreshContextProvider } from 'context/RefreshContext';
import { VaiContextProvider } from 'context/VaiContext';
import { MuiThemeProvider } from 'theme/MuiThemeProvider/MuiThemeProvider';

// Initialize internationalization library
initTranslationLibrary();

const renderComponent = (children: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  const renderRes = render(
    <Theme>
      <Web3Wrapper>
        <QueryClientProvider client={queryClient}>
          <MuiThemeProvider>
            <AuthProvider>
              <RefreshContextProvider>
                <VaiContextProvider>
                  <SuccessfulTransactionModalProvider>
                    <BrowserRouter>
                      <ToastContainer
                        autoClose={8000}
                        transition={Slide}
                        hideProgressBar
                        newestOnTop
                        position={toast.POSITION.TOP_LEFT}
                      />

                      <Switch>
                        <Route path="/" component={() => children} />
                      </Switch>
                    </BrowserRouter>
                  </SuccessfulTransactionModalProvider>
                </VaiContextProvider>
              </RefreshContextProvider>
            </AuthProvider>
          </MuiThemeProvider>
        </QueryClientProvider>
      </Web3Wrapper>
    </Theme>,
  );

  return {
    ...renderRes,
    queryClient,
  };
};

export default renderComponent;
