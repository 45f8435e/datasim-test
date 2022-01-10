import { Chart } from 'react-chartjs-2';
import React, { useMemo } from 'react';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { getDateLabel } from './utils';

const AlignmentsInfluenceTestResults = require('./alignments-influence-test-results.json') as IAlignmentsInfluenceTestResult[];

// -------------------------------------------------------------------------------------------------
// IAlignmentsInfluenceTestResult

interface IAlignmentsInfluenceTestResult {
  start: string;
  end: string;
  withAlignments: boolean;
  actors: Record<string, number>;
}

// -------------------------------------------------------------------------------------------------
// IAlignmentsInfluenceDataPoint

export interface IAlignmentsInfluenceDataPoint {
  label: string | string[];
  x: number;
  y: number;
}

// -------------------------------------------------------------------------------------------------
// AlignmentsInfluence

const AlignmentsInfluence = () => {
  // -------------------------------------------------------------------------------------------------
  // options

  const options: ChartOptions<'line'> = {
    responsive: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
      tooltip: {
        callbacks: {
          label: tooltipItem => {
            const dataPoint = tooltipItem.dataset.data[tooltipItem.dataIndex] as IAlignmentsInfluenceDataPoint;

            return dataPoint.label;
          },
        },
      },
    },
    scales: {
      x: {
        min: (() => {
          const date = new Date(AlignmentsInfluenceTestResults[0].start);

          date.setUTCHours(0, 0, 0, 0);

          return date.getTime();
        })(),
        max: (() => {
          const date = new Date(AlignmentsInfluenceTestResults[AlignmentsInfluenceTestResults.length - 1].end);

          date.setUTCHours(0, 0, 0, 0);
          date.setUTCDate(date.getUTCDate() + 1 + 1);

          return date.getTime();
        })(),
        ticks: {
          callback: value => getDateLabel(value as number),
          maxTicksLimit: 30,
          minRotation: 10,
        },
      },
    },
  };

  interface IResult {
    start: string;
    end: string;
    value: number;
  }

  interface IAlignmentsInfluenceTestResultsByActor {
    actor: string;
    withAlignments: IResult[];
    withoutAlignments: IResult[];
  }

  const valuesByActor = useMemo(
    () => AlignmentsInfluenceTestResults.reduce<Record<string, IAlignmentsInfluenceTestResultsByActor>>(
      (reduced, result) => {
        Object.entries(result.actors).forEach(([actor, value]) => {
          if (!reduced[actor]) {
            reduced[actor] = {
              actor,
              withAlignments: [],
              withoutAlignments: [],
            };
          }

          reduced[actor][result.withAlignments ? 'withAlignments' : 'withoutAlignments'].push({
            start: result.start,
            end: result.end,
            value,
          });
        });

        return reduced;
      },
      {},
    ),
    [AlignmentsInfluenceTestResults],
  );

  // -------------------------------------------------------------------------------------------------
  // data

  const AlignmentColors: string[] = [
    'rgb(255, 0, 0)',
    'rgb(199, 21, 133)',
    'rgb(255, 140, 0)',
    'rgb(255, 165, 0)',
    'rgb(255, 0, 255)',
    'rgb(108,30,239)',
    'rgb(127, 255, 0)',
    'rgb(46, 139, 87)',
    'rgb(0, 191, 255)',
    'rgb(0, 0, 255)',

    'rgb(100, 149, 237)',
    'rgb(123, 104, 238)',
    'rgb(65, 105, 225)',
    'rgb(0, 0, 255)',
    'rgb(0, 0, 205)',
    'rgb(0, 0, 139)',
    'rgb(0, 0, 128)',
    'rgb(25, 25, 112)',
    'rgb(210, 180, 140)',
    'rgb(188, 143, 143)',
    'rgb(244, 164, 96)',
    'rgb(218, 165, 32)',
    'rgb(184, 134, 11)',
    'rgb(205, 133, 63)',
    'rgb(210, 105, 30)',
    'rgb(139, 69, 19)',
    'rgb(160, 82, 45)',
    'rgb(165, 42, 42)',
    'rgb(128, 0, 0)',
    'rgb(211, 211, 211)',
    'rgb(192, 192, 192)',
    'rgb(169, 169, 169)',
    'rgb(128, 128, 128)',
    'rgb(105, 105, 105)',
    'rgb(119, 136, 153)',
    'rgb(112, 128, 144)',
    'rgb(47, 79, 79)',
    'rgb(0, 0, 0)'
  ];

  const data = useMemo((): ChartData<'line', IAlignmentsInfluenceDataPoint[]> => ({
    datasets: Object.values(valuesByActor).sort((a, b) => a.actor < b.actor ? -1 : 1)
      .reduce<ChartDataset<'line', IAlignmentsInfluenceDataPoint[]>[]>((datasets, resultsOfActor, index, resultsOfActors) => {
        ([[0, resultsOfActor.withoutAlignments], [1, resultsOfActor.withAlignments]] as const).forEach(([summand, results]) => {
          const color = AlignmentColors[index * 2 + summand];

          const datasetWithoutAlignments: ChartDataset<'line', IAlignmentsInfluenceDataPoint[]> = {
            label: resultsOfActor.actor.replace(/^mailto:/, '') + ' (' + (summand === 1 ? 'with' : 'without') + ' alignments)',
            data: results.map(result => ({
              label: [
                resultsOfActor.actor,
                getDateLabel(new Date(result.end).getTime()),
                result.value.toString(),
              ],
              x: new Date(result.end).getTime(),
              y: result.value,
            })),
            borderColor: color,
            showLine: true,
            backgroundColor: context => {
              return color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)');
            },
            pointRadius: 3,
            pointHoverRadius: 6,
          };

          datasets.push(datasetWithoutAlignments);
        });

        return datasets;
      }, []),
  }), [valuesByActor]);

    return (
    <div
      style={{
        margin: '40px 20px',
      }}
    >
      <Chart
        type="scatter"
        options={options}
        data={data}
      />
    </div>
  );
};

export {
  AlignmentsInfluence,
};
