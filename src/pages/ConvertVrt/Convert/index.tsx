/** @jsxImportSource @emotion/react */
import React from 'react';
import BigNumber from 'bignumber.js';
import noop from 'noop-ts';
import { Typography } from '@mui/material';
import {
  FormikTokenTextField,
  LabeledProgressBar,
  FormikSubmitButton,
  ConnectWallet,
  Icon,
  TokenTextField,
} from 'components';
import { useTranslation } from 'translation';
import useConvertToReadableCoinString from 'utilities/useConvertToReadableCoinString';
import { format } from 'utilities/common';
import { AmountForm, ErrorCode } from 'containers/AmountForm';
import PLACEHOLDER_KEY from 'constants/placeholderKey';
import { VRT_ID, XVS_ID } from '../constants';
import { useStyles } from '../styles';

interface ConvertProps {
  xvsTotalWei: BigNumber;
  xvsToVrtRate: BigNumber;
  vrtLimitUsedWei: BigNumber;
  vrtLimitWei: BigNumber;
  vrtConversionEndTime: string | undefined;
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
  const MINUTE_IN_MILISECONDS = 60 * 1000;
  const HOUR_IN_MILISECONDS = 60 * MINUTE_IN_MILISECONDS;
  const DAY_IN_MILISECONDS = 24 * HOUR_IN_MILISECONDS;
  const vestingTimeRemainingMs = new Date().getTime() - +vrtConversionEndTime * 1000;
  let relativeTimeValues: FormatI18nextRelativetimeValuesReturn = {
    realtiveTimeFormatValues: { count: Math.floor(vestingTimeRemainingMs / DAY_IN_MILISECONDS) },
    relativeTimeTranslationKey: 'convertVrt.remainingTimeDays',
  };
  if (vestingTimeRemainingMs === HOUR_IN_MILISECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: { count: Math.floor(vestingTimeRemainingMs / HOUR_IN_MILISECONDS) },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeHours',
    };
  } else if (vestingTimeRemainingMs < HOUR_IN_MILISECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: {
        count: Math.floor(vestingTimeRemainingMs / MINUTE_IN_MILISECONDS),
      },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeMinutes',
    };
  } else if (vestingTimeRemainingMs < DAY_IN_MILISECONDS) {
    relativeTimeValues = {
      realtiveTimeFormatValues: {
        hours: Math.floor(vestingTimeRemainingMs / HOUR_IN_MILISECONDS),
        minutes: Math.floor(
          ((vestingTimeRemainingMs % HOUR_IN_MILISECONDS) / HOUR_IN_MILISECONDS) * 60,
        ),
      },
      relativeTimeTranslationKey: 'convertVrt.remainingTimeHoursAndMinutes',
    };
  }
  return relativeTimeValues;
};

const Convert: React.FC<ConvertProps> = ({
  xvsTotalWei,
  xvsToVrtRate,
  vrtLimitUsedWei,
  vrtLimitWei,
  vrtConversionEndTime,
}) => {
  const styles = useStyles();
  const { t, Trans } = useTranslation();
  const readableXvsAvailable = useMemo(
    () =>
      useConvertToReadableCoinString({
        valueWei: xvsTotalWei,
        tokenId: XVS_ID,
      }),
    [xvsTotalWei],
  );
  const { relativeTimeTranslationKey, realtiveTimeFormatValues } =
    formatI18nextRelativetimeValues(vrtConversionEndTime);

  return (
    <div css={styles.root}>
      <section css={styles.title}>
        <Typography variant="h3">{readableXvsAvailable}</Typography>
        <Typography variant="small2">{t('convertVrt.xvsAVailable')}</Typography>
      </section>
      <ConnectWallet message={t('convertVrt.connectWalletToConvertVrtToXvs')}>
        <AmountForm onSubmit={noop} maxAmount={vrtLimitWei.toFixed()}>
          {({ values }) => {
            const xvsValue = useMemo(() => {
              if (values.amount) {
                return new BigNumber(values.amount).times(xvsToVrtRate).toFixed();
              }
              return '';
            }, [values.amount]);
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
                        values={{ amount: format(new BigNumber(vrtLimitWei)) }}
                      />
                    }
                    rightMaxButton={{
                      label: t('convertVrt.max').toUpperCase(),
                      valueOnClick: xvsTotalWei.toFixed(),
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
                    description={t('convertVrt.vrtEqualsXvs', { xvsToVrtRate })}
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
                  loading={false}
                  enabledLabel={t('convertVrt.convertVrttoXvs')}
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
      </ConnectWallet>
    </div>
  );
};

export default Convert;
