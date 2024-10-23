import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import {format} from "date-fns";
import {color} from "chart.js/helpers";

import {chartColors} from "./common";

import classes from '../ActiveTournament.module.scss';

const DivisionItemsWeek = ({tournament, title}) => {
  if (!tournament) {
    return '';
  }

  const labels = tournament.chartData.lastWeekPurchasesByDay.dates.map(dayIso8601 => format(new Date(dayIso8601), 'MMM d'));

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const datasets = [];
  let colorIndex = 0;
  const bgColors = chartColors();
  Object.entries(tournament.chartData.lastWeekPurchasesByDay.division).forEach(entry => {
    const itemId = entry[0];
    const data = entry[1];
    const itemDetails = tournament.purchasableItems.find(({identifier}) => identifier === itemId);
    if (itemDetails.name === title) {
      datasets.push({
        label: itemDetails.configuration.division,
        data: data,
        backgroundColor: bgColors[colorIndex],
      });
      colorIndex++;
    }
  });

  const chartData = {
    labels,
    datasets: datasets,
  };

  return (
    <div className={classes.Chart}>
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default DivisionItemsWeek
