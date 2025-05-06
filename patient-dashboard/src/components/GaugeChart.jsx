import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

const GaugeChart = ({ label, value, min, max, segments = 5, units = "" }) => {
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">{label}</h2>
            <ReactSpeedometer
              value={value}
              minValue={min}
              maxValue={max}
              segments={segments}
              needleColor="steelblue"
              startColor="green"
              endColor="red"
              height={180}
              ringWidth={30}
              textColor="#000"
              valueTextFontSize="18px"
              labelFontSize="12px"
              currentValueText={`value: ${value}${units}`}
            />
        </div>
    );
};

export default GaugeChart;
