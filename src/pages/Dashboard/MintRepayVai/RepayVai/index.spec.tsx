import React from 'react';
import BigNumber from 'bignumber.js';
import { waitFor, fireEvent } from '@testing-library/react';

import fakeTransactionReceipt from '__mocks__/models/transactionReceipt';
import { repayVai, useUserMarketInfo } from 'clients/api';
import useSuccessfulTransactionModal from 'hooks/useSuccessfulTransactionModal';
import { formatCoinsToReadableValue } from 'utilities/common';
import { AuthContext } from 'context/AuthContext';
import { VaiContext } from 'context/VaiContext';
import renderComponent from 'testUtils/renderComponent';
import { assetData } from '__mocks__/models/asset';
import RepayVai from '.';

jest.mock('clients/api');
jest.mock('components/Basic/Toast');
jest.mock('hooks/useSuccessfulTransactionModal');

const fakeAccountAddress = '0x0';
const fakeUserVaiMinted = new BigNumber('1000000');
const formattedFakeUserVaiMinted = formatCoinsToReadableValue({
  value: fakeUserVaiMinted,
  tokenId: 'vai',
});
const fakeVai = { ...assetData, id: 'vai', symbol: 'VAI', isEnabled: true };

describe('pages/Dashboard/MintRepayVai/RepayVai', () => {
  beforeEach(() => {
    (useUserMarketInfo as jest.Mock).mockImplementation(() => ({
      assets: [...assetData, fakeVai],
      userTotalBorrowLimit: new BigNumber('111'),
      userTotalBorrowBalance: new BigNumber('91'),
    }));
  });

  it('renders without crashing', async () => {
    const { getByText } = renderComponent(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          logOut: jest.fn(),
          openAuthModal: jest.fn(),
          closeAuthModal: jest.fn(),
          account: {
            address: fakeAccountAddress,
          },
        }}
      >
        <RepayVai />
      </AuthContext.Provider>,
    );
    await waitFor(() => getByText('Repay VAI balance'));
  });

  it('displays the correct repay VAI balance', async () => {
    const { getByText } = renderComponent(
      <AuthContext.Provider
        value={{
          login: jest.fn(),
          logOut: jest.fn(),
          openAuthModal: jest.fn(),
          closeAuthModal: jest.fn(),
          account: {
            address: fakeAccountAddress,
          },
        }}
      >
        <VaiContext.Provider
          value={{
            userVaiEnabled: true,
            userVaiMinted: fakeUserVaiMinted,
            mintableVai: new BigNumber(0),
            userVaiBalance: new BigNumber(0),
          }}
        >
          <RepayVai />
        </VaiContext.Provider>
      </AuthContext.Provider>,
    );
    await waitFor(() => getByText('Repay VAI balance'));

    // Check user repay VAI balance displays correctly
    await waitFor(() => getByText(formattedFakeUserVaiMinted));
  });

  it('lets user repay their VAI balance', async () => {
    const { openSuccessfulTransactionModal } = useSuccessfulTransactionModal();
    (repayVai as jest.Mock).mockImplementationOnce(async () => fakeTransactionReceipt);

    const fakeUserVaiBalance = fakeUserVaiMinted;

    const { getByText, getByPlaceholderText } = renderComponent(
      <VaiContext.Provider
        value={{
          userVaiEnabled: true,
          mintableVai: new BigNumber(0),
          userVaiMinted: fakeUserVaiMinted,
          userVaiBalance: fakeUserVaiBalance,
        }}
      >
        <AuthContext.Provider
          value={{
            login: jest.fn(),
            logOut: jest.fn(),
            openAuthModal: jest.fn(),
            closeAuthModal: jest.fn(),
            account: {
              address: fakeAccountAddress,
            },
          }}
        >
          <RepayVai />
        </AuthContext.Provider>
      </VaiContext.Provider>,
    );
    await waitFor(() => getByText('Repay VAI balance'));

    // Input amount
    const tokenTextFieldInput = getByPlaceholderText('0.00') as HTMLInputElement;
    fireEvent.change(tokenTextFieldInput, { target: { value: fakeUserVaiMinted.toString() } });

    // Check input value updated correctly
    expect(tokenTextFieldInput.value).toBe(fakeUserVaiMinted.toString());

    // Submit repayment request
    const submitButton = getByText('Repay VAI').closest('button') as HTMLButtonElement;
    await waitFor(() => expect(submitButton).toHaveProperty('disabled', false));
    fireEvent.click(submitButton);

    // Check repayVai was called correctly
    await waitFor(() => expect(repayVai).toHaveBeenCalledTimes(1));
    const fakeUserWeiMinted = fakeUserVaiMinted.multipliedBy(new BigNumber(10).pow(18));
    expect(repayVai).toHaveBeenCalledWith({
      fromAccountAddress: fakeAccountAddress,
      amountWei: fakeUserWeiMinted.toString(),
    });

    // Check successful transaction modal is displayed
    await waitFor(() => expect(openSuccessfulTransactionModal).toHaveBeenCalledTimes(1));
    expect(openSuccessfulTransactionModal).toHaveBeenCalledWith({
      transactionHash: fakeTransactionReceipt.transactionHash,
      amount: {
        tokenId: 'xvs',
        valueWei: fakeUserWeiMinted,
      },
      message: expect.any(String),
      title: expect.any(String),
    });
  });
  // @TODO: add tests to cover failing scenarios
});
