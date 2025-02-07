import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import {
  Area,
  Bar,
  XAxis,
  YAxis,
  Line,
  Cell,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  BarChart,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import { connectAccount } from 'core';
import { currencyFormatter } from 'utilities/common';
import { uid } from 'react-uid';
import { State } from 'core/modules/initialState';

const ChartWrapper = styled.div`
  width: 100% + 40px;
  margin: 10px -20px 10px;

  .title {
    text-align: right;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-main);
    margin-right: 20px;
  }

  .recharts-cartesian-grid {
    opacity: 0.05;
  }

  .chart1 {
    height: 150px;
  }
  .chart2 {
    height: 150px;
  }
`;

interface Props {
  marketType: string;
  graphType?: string;
  data: Array<Record<string, { name: string; apy: number }>>;
}

interface CustomChart2TooltipProps {
  active?: boolean;
  payload?: Array<{ value: BigNumber.Value }>;
}

function OverviewChart({ marketType, graphType, data }: Props) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
  }, [marketType]);

  const CustomizedAxisTick = () => (
    <g>
      <text x={0} y={0} dy={16}>
        {/* {moment(payload.value).format('LLLL')} */}
      </text>
    </g>
  );

  const CustomChart1Tooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: BigNumber.Value }>;
    label?: string;
  }) => {
    if (active && payload && payload.length !== 0) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ color: 'white' }}>
            {`${moment(label).format('LLL')}`}
          </p>
          <p className="label" style={{ color: 'white' }}>
            {`${marketType === 'supply' ? 'Supply APY' : 'Borrow APY'} : ${new BigNumber(
              payload[0].value,
            ).dp(8, 1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomChart2Tooltip = ({ active, payload }: CustomChart2TooltipProps) => {
    if (active && payload && payload.length !== 0) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ color: 'white' }}>
            {`${marketType === 'supply' ? 'Total Supply' : 'Total Borrow'} : ${currencyFormatter(
              payload[0].value ? payload[0].value : 0,
            )}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleMouseMove = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <ChartWrapper>
      <div className="title">APY</div>
      <div className="chart1">
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            syncId="apy-total"
            margin={{
              top: 10,
              right: 30,
              left: 30,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="barRedColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f06517" />
                <stop offset="100%" stopColor="#de4993" />
              </linearGradient>
              <linearGradient id="barGreenColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9dd562" />
                <stop offset="100%" stopColor="#9dd562" />
              </linearGradient>
              <linearGradient id="areaRedColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f06517" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f06517" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="areaGreenColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9dd562" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#9dd562" stopOpacity={0} />
              </linearGradient>
            </defs>
            {graphType === 'area' && <CartesianGrid />}
            <XAxis
              dataKey="createdAt"
              tickLine={false}
              axisLine={false}
              tick={<CustomizedAxisTick />}
            />
            <YAxis hide />
            <Tooltip cursor={false} content={<CustomChart1Tooltip />} />
            {graphType === 'area' && (
              <Area
                type="monotone"
                isAnimationActive
                dataKey={marketType === 'supply' ? 'supplyApy' : 'borrowApy'}
                stroke={`${marketType !== 'supply' ? 'url(#barRedColor)' : 'url(#barGreenColor)'}`}
                strokeWidth={2}
                fill={`${marketType !== 'supply' ? 'url(#areaRedColor)' : 'url(#areaGreenColor)'}`}
              />
            )}
            {graphType === 'composed' && (
              <Line
                type="monotone"
                dot={false}
                isAnimationActive
                dataKey={marketType === 'supply' ? 'supplyApy' : 'borrowApy'}
                stroke={`${marketType !== 'supply' ? 'url(#barRedColor)' : 'url(#barGreenColor)'}`}
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {graphType === 'composed' && (
        <div className="chart2">
          <ResponsiveContainer>
            <BarChart
              data={data}
              syncId="apy-total"
              margin={{
                top: 10,
                right: 30,
                left: 30,
                bottom: 0,
              }}
            >
              <linearGradient id="areaRedColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f06517" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f06517" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="areaGreenColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9dd562" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#9dd562" stopOpacity={0} />
              </linearGradient>
              <XAxis
                dataKey="createdAt"
                tickLine={false}
                axisLine={false}
                tick={<CustomizedAxisTick />}
              />
              <YAxis hide />
              <Tooltip cursor={false} content={<CustomChart2Tooltip />} />
              <Bar
                isAnimationActive
                dataKey={marketType === 'supply' ? 'totalSupply' : 'totalBorrow'}
                onMouseMove={handleMouseMove}
              >
                {data.map((entry: Record<string, { name: string; apy: number }>, index: number) => (
                  <Cell
                    cursor="pointer"
                    fill={
                      index === activeIndex
                        ? `${marketType !== 'supply' ? 'url(#barRedColor)' : 'url(#barGreenColor)'}`
                        : 'var(--color-bg-active)'
                    }
                    key={uid(entry)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartWrapper>
  );
}

OverviewChart.defaultProps = {
  marketType: 'supply',
  graphType: 'area',
  data: [],
};

const mapStateToProps = ({ account }: State) => ({
  settings: account.setting,
});

export default connectAccount(mapStateToProps)(OverviewChart);
