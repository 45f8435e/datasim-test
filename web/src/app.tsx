import React, { useMemo, useState } from 'react';
const STATEMENTS = require('./statements.json') as IStatement[];
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend, ChartOptions, ChartData, ChartDataset, ScriptableContext,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Colors } from './colors';
import { getDateLabel } from './utils';
import { AlignmentsInfluence } from './alignments-influence';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// -------------------------------------------------------------------------------------------------
// TStatement

export interface IStatement {
  id: string;
  actor: {
    mbox: string;
  };
  verb: {
    id: string;
  };
  object: {
    id: string;
  };
  timestamp: string;
}

// -------------------------------------------------------------------------------------------------
// IActorStatements

interface IActorStatements {
  mbox: string;
  statements: IStatement[];
}

// -------------------------------------------------------------------------------------------------
// selectStatements

function selectStatements(statements: IStatement[], selection: { verbs?: string[] }): IStatement[] {
  return statements.filter(statement => !(
    selection.verbs
    && !selection.verbs.some(verb => statement.verb.id.endsWith(verb))
  ));
}

// -------------------------------------------------------------------------------------------------
// ButtonProps

interface ButtonProps {
  label: string;
  onClick(): void;
  color?: string;
  selected?: boolean;
}

// -------------------------------------------------------------------------------------------------
// Button

const Button = (props: ButtonProps) => {
  const { label, onClick, color, selected } = props;

  return (
    <div
      style={{
        padding: '2px 4px',
        border: `1px solid ${color}`,
        backgroundColor: selected ? color : undefined,
        borderRadius: 4,
        color: selected ? '#fff' : undefined,
        marginRight: 4,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
// IDataPoint

interface IDataPoint {
  label: string | string[];
  x: number;
  y: number;
}

console.log('number of statements', STATEMENTS.length);

// -------------------------------------------------------------------------------------------------
// App

const App = () => {
  // -----------------------------------------------------------------------------------------------
  // statementsByActor

  const statementsByActor: Record<string, IActorStatements> = useMemo(() => {
    const buckets: Record<string, IActorStatements> = {};

    STATEMENTS.forEach(statement => {
      let bucket = buckets[statement.actor.mbox];

      if (!bucket) {
        bucket = {
          mbox: statement.actor.mbox,
          statements: [],
        };

        buckets[statement.actor.mbox] = bucket;
      }

      bucket.statements.push(statement);
    });

    return buckets
  }, [STATEMENTS]);

  const [numberOfActors, setNumberOfActors] = useState<number>(200);

  // -------------------------------------------------------------------------------------------------
  // sortedStatementsByActor

  const sortedStatementsByActor = useMemo(
    (): IActorStatements[] => Object.values(statementsByActor)
      .sort((a, b) => a.mbox < b.mbox ? -1 : 1)
      .slice(0, numberOfActors),
    [statementsByActor, numberOfActors],
  );

  // -------------------------------------------------------------------------------------------------
  // options

  const options: ChartOptions<'line'> = {
    responsive: true,
    aspectRatio: sortedStatementsByActor.length + 1 > 40 ? 1 : 2,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
      filler: {

      },
      tooltip: {
        callbacks: {
          label: tooltipItem => {
            const dataPoint = tooltipItem.dataset.data[tooltipItem.dataIndex] as IDataPoint;

            return dataPoint.label;
          },
        },
      },
    },
    scales: {
      x: {
        min: (() => {
          const date = new Date(STATEMENTS[0].timestamp);

          date.setUTCHours(0, 0, 0, 0);

          return date.getTime();
        })(),
        max: (() => {
          const date = new Date(STATEMENTS[STATEMENTS.length - 1].timestamp);

          date.setUTCHours(0, 0, 0, 0);
          date.setUTCDate(date.getUTCDate() + 1);

          return date.getTime();
        })(),
        ticks: {
          callback: function(value, index, values) {
            return getDateLabel(value as number);
          },
          maxTicksLimit: 20,
          minRotation: 10,
        },
      },
      y: {
        min: 0,
        max: sortedStatementsByActor.length + 1,
        ticks: {
          callback(tickValue, index) {
            if (tickValue === 0 || tickValue === sortedStatementsByActor.length + 1) {
              return undefined;
            }

            return `Actor ${tickValue}`;
          },
        },
      },
    },
  };

  // -------------------------------------------------------------------------------------------------
  // ColorSelection

  const ColorSelection = Colors.slice(0, 120);

  // -------------------------------------------------------------------------------------------------
  // data

  const data = useMemo((): ChartData<'line', IDataPoint[]> => ({
    datasets: sortedStatementsByActor.reduce<ChartDataset<'line', IDataPoint[]>[]>((datasets, bucket, bucketIndex) => {
      let color = ColorSelection[bucketIndex % ColorSelection.length];

      datasets.push({
        label: bucket.mbox.replace(/^mailto:/, ''),
        data: bucket.statements.map(statement => ({
          label: [
            statement.verb.id.replace(/\/(.+)$/, '$1'),
            statement.object.id.replace(/\/(.+)$/, '$1'),
            getDateLabel(new Date(statement.timestamp).getTime()),
          ],
          x: new Date(statement.timestamp).getTime(),
          y: bucketIndex + 1,
        })),
        borderColor: color,
        showLine: false,
        backgroundColor: color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)'),
        pointRadius: numberOfActors > 50 ? 3 :  6,
        pointHoverRadius: numberOfActors > 50 ? 6 : 8,
      });

      if (sortedStatementsByActor.length < 10) {
        const partStatements = (() => {
          let isStart = true;

          return bucket.statements.reduce<IStatement[]>((statements, statement, statementIndex) => {
            if (isStart) {
              isStart = false;

              statements.push(statement);
            } else if (
              statement.verb.id.endsWith('downloaded')
              || statement.verb.id.endsWith('started')
              || statement.verb.id.endsWith('played')
              || statement.verb.id.endsWith('completed')
            ) {
              statements.push(statement);
            } else if (statementIndex === bucket.statements.length - 1) {
              const date = new Date(statement.timestamp);

              date.setUTCHours(23, 59, 0, 0);

              statements.push({
                id: 'only-for-visualization',
                actor: {
                  mbox: 'only-for-visualization',
                },
                verb: {
                  id: 'only-for-visualization',
                },
                object: {
                  id: 'only-for-visualization',
                },
                timestamp: date.toISOString(),
              });
            }

            return statements;
          }, []);
        })();

        datasets.push({
          label: `${bucket.mbox.replace(/^mailto:/, '')} (p)`,
          data: partStatements.map((statement, statementIndex) => ({
            label: [
              statement.verb.id.replace(/\/(.+)$/, '$1'),
              statement.object.id.replace(/\/(.+)$/, '$1'),
              getDateLabel(new Date(statement.timestamp).getTime()),
            ],
            x: new Date(statement.timestamp).getTime(),
            y: bucketIndex + 1 + 0.2,
          })),
          borderColor: 'rgba(0, 0, 0, 0)', // color,
          showLine: true,
          backgroundColor: context => {
            const statement = partStatements[context.dataIndex] as IStatement;

            if (statement && statement.verb.id.endsWith('failed')) {
              return 'rgb(238,13,13)';
            }

            if (statement && statement.verb.id.endsWith('aborted')) {
              return 'rgb(255,243,26)';
            }

            return 'rgba(0, 0, 0, 0)'; // color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)');
          },
          segment: {
            borderColor: ctx => {
              const p0statement = partStatements[ctx.p0DataIndex] as IStatement;
              const p1statement = partStatements[ctx.p1DataIndex] as IStatement;

              if (p0statement.verb.id.endsWith('material/downloaded')) {
                return 'rgb(238,151,22)';
              }

              if (p0statement.verb.id.endsWith('video/played')) {
                return 'rgb(51,245,177)';
              }

              if (p0statement.verb.id.endsWith('video/completed')) {
                return 'rgba(0, 0, 0, 0)'; // 'rgb(51,239,245)';
              }

              if (p0statement.verb.id.endsWith('test/started')) {
                return 'rgb(51,184,245)';
              }

              if (p0statement.verb.id.endsWith('test/completed')) {
                return 'rgb(255, 255, 255)'; // 'rgb(0, 0, 0)';
              }

              if (p0statement && /completed$/.test(p0statement.verb.id)) {
                return 'rgb(0, 0, 0)';
              }

              if (1 === 1) {
                return 'rgba(0, 0, 0, 0, 0)';
              }

              return color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)');
            },
          },
          pointRadius: numberOfActors > 50 ? 3 : 8,
          pointHoverRadius: numberOfActors > 50 ? 6 : 12,
        });

        const specialStatements = (() => {
          return bucket.statements.reduce<IStatement[]>((statements, statement, statementIndex) => {
            if (
              (
                statement.verb.id.endsWith('failed')
                || statement.object.id.endsWith('activity/a2')
              )
              || (
                statement.verb.id.endsWith('aborted')
                || statement.object.id.endsWith('activity/c2')
              )
            ) {
              statements.push(statement);
            }

            return statements;
          }, []);
        })();

        const specialStatementColor = (context: ScriptableContext<'line'>) => {
          const statement = specialStatements[context.dataIndex] as IStatement;

          if (
            statement
            && (
              statement.verb.id.endsWith('failed')
              || statement.object.id.endsWith('activity/a2')
            )
          ) {
            return 'rgb(255,0,251)';
          }

          if (
            statement
            && (
              statement.verb.id.endsWith('aborted')
              || statement.object.id.endsWith('activity/c2')
            )
          ) {
            return 'rgb(26,37,255)';
          }

          return 'rgba(0, 0, 0, 0)'; // color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)');
        };

        datasets.push({
          label: `${bucket.mbox.replace(/^mailto:/, '')} (a/f)`,
          data: specialStatements.map((statement, statementIndex) => ({
            label: [
              statement.verb.id.replace(/\/(.+)$/, '$1'),
              statement.object.id.replace(/\/(.+)$/, '$1'),
              getDateLabel(new Date(statement.timestamp).getTime()),
            ],
            x: new Date(statement.timestamp).getTime(),
            y: bucketIndex + 1 + 0.4,
          })),
          borderColor: specialStatementColor, // 'rgba(0, 0, 0, 0)', // color,
          showLine: false,
          backgroundColor: context => specialStatementColor(context).replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)'),
          pointRadius: numberOfActors > 50 ? 3 : 8,
          pointHoverRadius: numberOfActors > 50 ? 6 : 12,
        });
      }

      return datasets;
    }, []),
  }), [sortedStatementsByActor, numberOfActors]);

  const [actorIndex, setActorIndex] = useState<number>(0);

  return (
    <div
      style={{
        fontFamily: 'Arial',
      }}
    >
      <h2>
        {'normal run: results'}
      </h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: 4 }}>
          {'change number of actors shown:'}
        </div>
        {[10, 50, 100, 150].map(numOfActorsOption => (
          <Button
            key={numOfActorsOption}
            label={numOfActorsOption.toString()}
            color={'rgb(0, 0, 0)'}
            onClick={() => setNumberOfActors(numOfActorsOption)}
            selected={numberOfActors === numOfActorsOption}
          />
        ))}
      </div>
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
      <div>
        {sortedStatementsByActor.map((actorStatements, index) => (
          <p key={actorStatements.mbox}>
            {actorStatements.mbox}
            {': '}
            {selectStatements(actorStatements.statements, { verbs: ['failed'] }).length}
            {'x test failed, '}
            {selectStatements(actorStatements.statements, { verbs: ['aborted'] }).length}
            {'x test aborted'}
          </p>
        ))}
      </div>
      <h2>
        {'alignments influence: results'}
      </h2>
      <AlignmentsInfluence />
      <h2>
        {'normal run: generated statements by actor (only timestamp, actor.mbox, verb.id & object.id)'}
      </h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {sortedStatementsByActor.map((actorStatements, index) => {
          const color = ColorSelection[index % ColorSelection.length];

          return (
            <Button
              key={actorStatements.mbox}
              label={actorStatements.mbox.replace(/^mailto:/, '')}
              color={color}
              onClick={() => setActorIndex(index)}
              selected={index === actorIndex}
            />
          );
        })}
      </div>
      <div>
        {sortedStatementsByActor[actorIndex] && sortedStatementsByActor[actorIndex].statements.map(statement => (
          <div key={statement.timestamp}>
            {statement.timestamp}
            <br />
            {statement.actor.mbox}
            <br />
            {statement.verb.id}
            <br />
            {statement.object.id}
            <br />
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  App,
};
