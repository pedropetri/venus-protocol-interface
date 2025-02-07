/** @jsxImportSource @emotion/react */
import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Typography } from '@mui/material';
import { ProgressBar, Table, Token, ITableProps, LayeredValues } from 'components';
import { useTranslation } from 'translation';
import { Asset, TokenId } from 'types';
import {
  formatCoinsToReadableValue,
  formatCentsToReadableValue,
  formatToReadablePercentage,
} from 'utilities/common';
import { useIsSmDown, useIsLgDown } from 'hooks/responsive';
import { useStyles as useSharedStyles } from '../styles';
import { useStyles as useLocalStyles } from './styles';

export interface IBorrowingUiProps extends Pick<ITableProps, 'rowOnClick'> {
  assets: Asset[];
  isXvsEnabled: boolean;
  userTotalBorrowLimit: BigNumber;
}

const BorrowingTable: React.FC<IBorrowingUiProps> = ({
  assets,
  isXvsEnabled,
  userTotalBorrowLimit,
  rowOnClick,
}) => {
  const { t } = useTranslation();
  const isSmDown = useIsSmDown();
  const isLgDown = useIsLgDown();
  const sharedStyles = useSharedStyles();
  const localStyles = useLocalStyles();
  const styles = { ...sharedStyles, ...localStyles };

  const columns = useMemo(
    () => [
      { key: 'asset', label: t('markets.columns.asset'), orderable: false },
      { key: 'apyEarned', label: t('markets.columns.apyEarned'), orderable: true },
      { key: 'balance', label: t('markets.columns.balance'), orderable: true },
      { key: 'percentOfLimit', label: t('markets.columns.percentOfLimit'), orderable: true },
    ],
    [],
  );

  // Format assets to rows
  const rows: ITableProps['data'] = assets.map(asset => {
    const borrowApy = isXvsEnabled ? asset.xvsBorrowApy.plus(asset.borrowApy) : asset.borrowApy;
    const percentOfLimit = asset.borrowBalance.div(userTotalBorrowLimit).times(100);
    return [
      {
        key: 'asset',
        render: () => <Token symbol={asset.symbol as TokenId} />,
        value: asset.id,
      },
      {
        key: 'apyEarned',
        render: () => <div>{formatToReadablePercentage(borrowApy)}</div>,
        value: borrowApy.toNumber(),
      },
      {
        key: 'balance',
        render: () => (
          <LayeredValues
            topValue={formatCentsToReadableValue({
              value: asset.borrowBalance.multipliedBy(asset.tokenPrice).multipliedBy(100),
            })}
            bottomValue={formatCoinsToReadableValue({
              value: asset.borrowBalance,
              tokenId: asset.id as TokenId,
              shorthand: true,
            })}
          />
        ),
        value: asset.borrowBalance.toString(),
      },
      {
        key: 'percentOfLimit',
        render: () => (
          <span css={styles.percentOfLimit}>
            <ProgressBar
              min={0}
              max={100}
              value={+percentOfLimit}
              step={1}
              ariaLabel={t('markets.columns.percentOfLimit')}
            />
            <Typography variant="small2" css={styles.white}>
              {formatToReadablePercentage(percentOfLimit.toFixed(2))}
            </Typography>
          </span>
        ),
        value: asset.liquidity.toNumber(),
      },
    ];
  });

  return (
    <Table
      title={isLgDown && !isSmDown ? undefined : t('markets.borrowingTableTitle')}
      columns={columns}
      data={rows}
      initialOrder={{
        orderBy: 'apyEarned',
        orderDirection: 'desc',
      }}
      rowKeyIndex={0}
      rowOnClick={rowOnClick}
      gridTemplateColumns={styles.getGridTemplateColumns({ isMobile: isSmDown })}
    />
  );
};

export default BorrowingTable;
