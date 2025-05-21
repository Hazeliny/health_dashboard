import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import DataAggregator from './DataAggregator';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const TrendPanel = ({ open, onClose, data, metric, range, setRange }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (open && chartRef.current) {
      chartRef.current.resetZoom();
    }
  }, [open]);

//  if (!open || !data || !metric) return null;
  if (!open) return null;

  const requiredDataPointsMap = {
    '24h': 12,
    '7d': 12,
    '30d': 12,
  };
  
  const requiredDataPoints = requiredDataPointsMap[range] || 12;
  const filteredData = data.slice(-requiredDataPoints) || [];

  //expand the structure of bloodPressure object at frontend instead of at backend
  const normalizedData = metric === 'bloodPressure'
    ? filteredData.map(item => ({
        timestamp: item.timestamp,
        systolic: item.value?.systolic,
        diastolic: item.value?.diastolic,
      }))
    : filteredData.map(item => ({
        timestamp: item.timestamp,
        value: item.value,
      }));

  // Now aggregate data according to the selected range
  const aggregatedData = <DataAggregator data={normalizedData} range={range} />;

  let chartData;
  let yAxisTitle;

  if (metric === 'bloodPressure') {
    chartData = {
      labels: normalizedData.map(item => new Date(item.timestamp)),
      datasets: [
        {
          label: 'Systolic',
          data: normalizedData.map(item => item.systolic),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.2,
          fill: false,
        },
        {
          label: 'Diastolic',
          data: normalizedData.map(item => item.diastolic),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.2,
          fill: false,
        },
      ],
    };
    yAxisTitle = 'mmHg';
  } else {
    chartData = {
      labels: normalizedData.map((item) => new Date(item.timestamp)),
      datasets: [
        {
          label: metric,
          data: normalizedData.map((item) => item.value),
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    };
    yAxisTitle = metric;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle,
        },
      },
    },
  };

  return (
    <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg z-50 overflow-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold dark:text-gray-600">
          {metric === 'bloodPressure' ? 'Blood Pressure Trend' : `${metric} Trend`}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded dark:bg-gray-200 dark:hover:bg-gray-300">&times;
          Close
        </button>
      </div>

      {/* Range selector */}
      <div className="flex justify-end space-x-2 px-4 pt-2">
        {['24h', '7d', '30d'].map((option) => (
          <button
            key={option}
            onClick={() => setRange(option)}
            className={`px-3 py-1 text-sm rounded ${
              range === option ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            } hover:bg-blue-500 hover:text-white transition`}
          >
            {option}
          </button>
        ))}
      </div>

      {normalizedData.length < requiredDataPoints ? (
        <div className="p-4 text-gray-500 text-center">
          Insufficient data for {range} view. Please wait for more data to accumulate.
        </div>
      ) : (
        <div className="p-4">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default TrendPanel;
