export const aggregateBloodPressure = (data, interval) => {
    const aggregatedData = [];
    for (let i = 0; i < data.length; i += interval) {
        const chunk = data.slice(i, i + interval);
        const aggregatedItem = chunk.reduce(
            (sum, current) => {
                sum.systolic += current.systolic;
                sum.diastolic += current.diastolic;
                return sum;
            },
            { systolic: 0, diastolic: 0 }
        );
        
        aggregatedItem.systolic /= chunk.length;
        aggregatedItem.diastolic /= chunk.length;
        aggregatedData.push({
            ...aggregatedItem,  //spread operator
            timestamp: chunk[chunk.length - 1].timestamp,
        });
    }
    return aggregatedData;
};

export const aggregateSingleMetric = (data, interval) => {
    const aggregatedData = [];
    for (let i = 0; i < data.length; i += interval) {
        const chunk = data.slice(i, i + interval);
        const avgValue = chunk.reduce((sum, current) => sum + current.value, 0) / chunk.length;
        aggregatedData.push({
            value: avgValue,
            timestamp: chunk[chunk.length - 1].timestamp,
        });
    }
    return aggregatedData;
};
