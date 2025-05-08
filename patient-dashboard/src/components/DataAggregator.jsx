import React from 'react';

// Helper function to aggregate data
const aggregateData = (data, interval) => {
  const aggregatedData = [];
  for (let i = 0; i < data.length; i += interval) {
    const chunk = data.slice(i, i + interval);
    const aggregatedItem = chunk.reduce(
      (acc, current) => {
        acc.systolic += current.value.systolic;
        acc.diastolic += current.value.diastolic;
        acc.timestamp = current.timestamp;
        return acc;
      },
      { systolic: 0, diastolic: 0, timestamp: 0 }
    );

    // Calculate average systolic and diastolic for this interval
    aggregatedItem.systolic = aggregatedItem.systolic / chunk.length;
    aggregatedItem.diastolic = aggregatedItem.diastolic / chunk.length;

    aggregatedData.push(aggregatedItem);
  }
  return aggregatedData;
};

const DataAggregator = ({ data, range }) => {
  const interval = range === '7d' ? 7 : range === '30d' ? 30 : 1;
  const aggregatedData = aggregateData(data, interval);
  return (
    <>
      {aggregatedData.map((item, index) => (
        <div key={index}>{`Systolic: ${item.systolic}, Diastolic: ${item.diastolic}`}</div>
      ))}
    </>
  );
};

export default DataAggregator;
