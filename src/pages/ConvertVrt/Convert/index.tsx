/** @jsxImportSource @emotion/react */
import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import noop from 'noop-ts';
import { Typography } from '@mui/material';
import {
  FormikTokenTextField,
  LabeledProgressBar,
  FormikSubmitButton,
  ConnectWallet,
  EnableToken,
  Icon,
  TokenTextField,
} from 'components';
import useSuccessfulTransactionModal from 'hooks/useSuccessfulTransactionModal';
import toast from 'components/Basic/Toast';
import { useTranslation } from 'translation';
import useConvertToReadableCoinString from 'hooks/useConvertToReadableCoinString';
import { AmountForm, ErrorCode } from 'containers/AmountForm';
import PLACEHOLDER_KEY from 'constants/placeholderKey';
import { convertWeiToCoins } from 'utilities/common';
import { getContractAddress } from 'utilities';
import { VRT_ID, XVS_ID } from '../constants';
import { useStyles } from '../styles';

interface ConvertProps {
  xvsToVrtConversionRatio: BigNumber;
  vrtLimitUsedWei: BigNumber;
  vrtLimitWei: BigNumber;
  vrtConversionEndTime: string;
  userVrtBalanceWei: BigNumber;
  vrtConversionLoading: boolean;
  userVrtEnabled: boolean;
  convertVrt: (amount: string) => Promise<string>;
}

type FormatI18nextRelativetimeValuesReturn =
  | {
      relativeTimeTranslationKey: 'convertVrt.remainingTimeHoursAndMinutes';
      realtiveTimeFormatValues: { hours: number; minutes: number };
    }
  | {
      relativeTimeTranslationKey:
        | 'convertVrt.remainingTimeDays'
        | 'convertVrt.remainingTimeHours'
        | 'convertVrt.remainingTimeMinutes';
      realtiveTimeFormatValues: { count: number };
    }
  | {
      relativeTimeTranslationKey: 'convertVrt.remainingTimeMissing';
      realtiveTimeFormatValues: { count: string };
    };
// Don't remove this comment, it allows for translation keys set by this function to be collected
// t('convertVrt.remainingTimeDays_one') t('convertVrt.remainingTimeDays_other') t('convertVrt.remainingTimeHours_one') t('convertVrt.remainingTimeHours_other')
// t('convertVrt.remainingTimeHoursAndMinutes') t('convertVrt.remainingTimeMinutes') t('convertVrt.remainingTimeMinutes_other') t('convertVrt.minutes_one')
// t('convertVrt.minutes_other') t('convertVrt.hours_one') t('convertVrt.hours_other') t('convertVrt.days_one') t('convertVrt.days_other')
const formatI18nextRelativetimeValues = (
  vrtConversionEndTime: string | undefined,
): FormatI18nextRelativetimeValuesReturn => {
  if (vrtConversionEndTime === undefined) {
    return {
      realtiveTimeFormatValues: { count: PLACEHOLDER_KEY },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeMissing',
    };
  }
  const MINUTE_IN_SECONDS = 60;
  const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
  const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
  const vestingTimeRemainingMs = +vrtConversionEndTime - new Date().getTime() / 1000;
  let relativeTimeValues: FormatI18nextRelativetimeValuesReturn = {
    realtiveTimeFormatValues: { count: Math.floor(vestingTimeRemainingMs / DAY_IN_SECONDS) },
    relativeTimeTranslationKey: 'convertVrt.remainingTimeDays',
  };
  if (vestingTimeRemainingMs === HOUR_IN_SECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: { count: Math.floor(vestingTimeRemainingMs / HOUR_IN_SECONDS) },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeHours',
    };
  } else if (vestingTimeRemainingMs < HOUR_IN_SECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: {
        count: Math.floor(vestingTimeRemainingMs / MINUTE_IN_SECONDS),
      },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeMinutes',
    };
  } else if (vestingTimeRemainingMs < DAY_IN_SECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: {
        hours: Math.floor(vestingTimeRemainingMs / HOUR_IN_SECONDS),
        minutes: Math.floor(((vestingTimeRemainingMs % HOUR_IN_SECONDS) / HOUR_IN_SECONDS) * 60),
      },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeHoursAndMinutes',
    };
  }
  return relativeTimeValues;
};

const Convert: React.FC<ConvertProps> = ({
  xvsToVrtConversionRatio,
  vrtLimitUsedWei,
  vrtLimitWei,
  vrtConversionEndTime,
  userVrtBalanceWei,
  vrtConversionLoading,
  userVrtEnabled,
  convertVrt,
}) => {
  const styles = useStyles();
  const { t, Trans } = useTranslation();
  const { openSuccessfulTransactionModal } = useSuccessfulTransactionModal();
  const readableXvsAvailable = useConvertToReadableCoinString({
    valueWei: userVrtBalanceWei.times(xvsToVrtConversionRatio),
    tokenId: XVS_ID,
  });
  const readableUserVrtBalance = useConvertToReadableCoinString({
    valueWei: userVrtBalanceWei,
    tokenId: VRT_ID,
  });
  const { relativeTimeTranslationKey, realtiveTimeFormatValues } =
    formatI18nextRelativetimeValues(vrtConversionEndTime);
  const vrtConverterProxyAddress = getContractAddress('vrtConverterProxy');
  const userVrtBalanceCoins = useMemo(
    () => convertWeiToCoins({ value: userVrtBalanceWei, tokenId: VRT_ID }),
    [userVrtBalanceWei],
  );

  const onSubmit = async (amountWei: string) => {
    try {
      const transactionHash = await convertVrt(new BigNumber(amountWei).toFixed());
      // Display successful transaction modal
      openSuccessfulTransactionModal({
        title: t('convertVrt.successfulConvertTransactionModal.title'),
        message: t('convertVrt.successfulConvertTransactionModal.message'),
        amount: {
          valueWei: new BigNumber(amountWei).times(xvsToVrtConversionRatio),
          tokenId: VRT_ID,
        },
        transactionHash,
      });
    } catch (err) {
      toast.error({ title: (err as Error).message });
    }
  };

  return (
    <div css={styles.root}>
      <section css={styles.title}>
        <Typography variant="h3">{readableXvsAvailable}</Typography>
        <Typography variant="small2">{t('convertVrt.xvsAVailable')}</Typography>
      </section>
      <ConnectWallet message={t('convertVrt.connectWalletToConvertVrtToXvs')}>
        <EnableToken
          title={t('convertVrt.enableVrt')}
          assetId={VRT_ID}
          isEnabled={userVrtEnabled}
          tokenInfo={[
            {
              iconName: 'xvs',
              label: 'VRT Conversion Ratio',
              children: xvsToVrtConversionRatio.toFixed(6),
            },
            { iconName: 'vrt', label: 'Current VRT Balance', children: readableUserVrtBalance },
          ]}
          vtokenAddress={vrtConverterProxyAddress}
        >
          <AmountForm onSubmit={onSubmit} maxAmount={userVrtBalanceWei?.toFixed()}>
            {({ values }) => {
              const xvsValue = useMemo(() => {
                if (values.amount && xvsToVrtConversionRatio) {
                  return new BigNumber(values.amount).times(xvsToVrtConversionRatio).toFixed();
                }
                return '';
              }, [values.amount, xvsToVrtConversionRatio]);
              return (
                <>
                  <div css={styles.inputSection}>
                    <Typography variant="small2" css={styles.inputLabel}>
                      {t('convertVrt.convertVrt')}
                    </Typography>
                    <FormikTokenTextField
                      tokenId={VRT_ID}
                      name="amount"
                      css={styles.input}
                      description={
                        <Trans
                          i18nKey="convertVrt.balance"
                          components={{
                            White: <span css={styles.whiteLabel} />,
                          }}
                          values={{ amount: userVrtBalanceCoins }}
                        />
                      }
                      rightMaxButton={{
                        label: t('convertVrt.max').toUpperCase(),
                        valueOnClick: userVrtBalanceWei?.toFixed() || '',
                      }}
                      displayableErrorCodes={[ErrorCode.HIGHER_THAN_MAX]}
                    />
                  </div>
                  <div css={styles.inputSection}>
                    <Typography variant="small2" css={styles.inputLabel}>
                      {t('convertVrt.youWillReceive')}
                    </Typography>
                    <TokenTextField
                      tokenId={XVS_ID}
                      name="xvs"
                      css={styles.input}
                      description={t('convertVrt.vrtEqualsXvs', {
                        xvsToVrtConversionRatio: xvsToVrtConversionRatio?.toFixed(6),
                      })}
                      disabled
                      value={xvsValue}
                      onChange={noop}
                    />
                  </div>
                  <div css={styles.progressBar}>
                    <LabeledProgressBar
                      greyLeftText={t('convertVrt.dailyLimit')}
                      whiteRightText={t('convertVrt.usedOverTotalVrt', {
                        used: vrtLimitUsedWei,
                        total: vrtLimitWei,
                      })}
                      value={vrtLimitUsedWei.dividedBy(vrtLimitWei).times(100).toNumber()}
                      step={1}
                      min={0}
                      max={100}
                      mark={undefined}
                      ariaLabel={t('convertVrt.progressBar')}
                    />
                  </div>
                  <FormikSubmitButton
                    css={styles.submitButton}
                    fullWidth
                    loading={vrtConversionLoading}
                    enabledLabel={t('convertVrt.convertVrttoXvs')}
                    disabled={+vrtConversionEndTime < Date.now() / 1000 || vrtConversionLoading}
                  />
                  <Typography css={styles.remainingTime}>
                    <Trans
                      i18nKey={relativeTimeTranslationKey}
                      components={{
                        Icon: <Icon name="countdown" />,
                        White: <span css={styles.whiteLabel} />,
                      }}
                      values={realtiveTimeFormatValues}
                    />
                  </Typography>
                </>
              );
            }}
          </AmountForm>
        </EnableToken>
      </ConnectWallet>
    </div>
  );
};

export default Convert;
