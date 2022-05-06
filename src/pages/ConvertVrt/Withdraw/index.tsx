/** @jsxImportSource @emotion/react */
import React from 'react';
import BigNumber from 'bignumber.js';
import { Typography } from '@mui/material';
import { PrimaryButton } from 'components';
import useConvertToReadableCoinString from 'hooks/useConvertToReadableCoinString';
import { useTranslation } from 'translation';
import { XVS_ID } from '../constants';
import { useStyles } from '../styles';

interface WithdrawProps {
  xvsVestedBalanceWei: BigNumber;
}

const Withdraw: React.FC<WithdrawProps> = ({ xvsVestedBalanceWei }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const readableXvsAvailable = useConvertToReadableCoinString({
    valueWei: xvsVestedBalanceWei,
    tokenId: XVS_ID,
  });
  return (
    <div css={styles.root}>
      <section css={styles.title}>
        <Typography variant="h3">{readableXvsAvailable}</Typography>
        <Typography variant="small2">{t('convertVrt.withdrawableAmount')}</Typography>
      </section>
      <PrimaryButton fullWidth>{t('convertVrt.withdrawXvs')}</PrimaryButton>
    </div>
  );
};

export default Withdraw;
