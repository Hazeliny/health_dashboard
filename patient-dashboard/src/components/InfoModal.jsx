import React from "react"
import GaugeChart from "./GaugeChart"

const InfoModal = ({ open, onClose, data, metric }) => {
    if (!open) return null;

    const config = {
        temperature: { label: "Temperature", min: 30.0, max: 42.0, units: " °C" },
        heartRate: { label: 'Heart Rate', min: 38, max: 120, units: " bpm" },
        bloodPressure: {
            label: "Blood Pressure",
            systolic: { min: 60, max: 160 },
            diastolic: { min: 30, max: 100 },
        },
        oxygenSaturation: { label: "Oxygen Saturation", min: 80, max: 100, units: "%" },
        respiratoryRate: { label: "Respiratory Rate", min: 8, max: 25, units: " breaths/min" },
        bloodGlucose: { label: "Blood Glucose", min: 2.0, max: 9.0, units: " mmol/L" },
    };

    if (!metric || !config[metric]) {
        return (
          <div className="fixed inset-0 z-50 flex items-center">
            <div className="bg-white p-6">
              <button onClick={onClose}>Close</button>
              <p className="text-red-500">Invalid metric data</p>
            </div>
          </div>
        );
    }      

    const isBloodPressure = metric === "bloodPressure";

    return (
        <div className="fixed inset-0 z-50 flex items-center">
          <div
            className="bg-white shadow-lg h-full w-[400px] p-6 transition-transform transform duration-300 translate-x-0"
            style={{ animation: "slideInLeft 0.3s ease-out" }}
          >
            <button onClick={onClose} className="float-right text-gray-500 hover:text-black">✖</button>
            <h2 className="text-xl font-bold mb-6 dark:text-gray-600">{config[metric].label}</h2>
            {isBloodPressure ? (
              <div className="flex flex-col gap-8 mt-8">
                <GaugeChart
                  label="Systolic"
                  value={data.bloodPressure.systolic}
                  min={config.bloodPressure.systolic.min}
                  max={config.bloodPressure.systolic.max}
                  units="mmHg"
                />
                <GaugeChart
                  label="Diastolic"
                  value={data.bloodPressure.diastolic}
                  min={config.bloodPressure.diastolic.min}
                  max={config.bloodPressure.diastolic.max}
                  units="mmHg"
                />
              </div>
            ) : (
              <GaugeChart
                label={config[metric].label}
                value={data[metric]}
                min={config[metric].min}
                max={config[metric].max}
                units={config[metric].units}
              />
            )}
          </div>
          {/* Blur background area */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={onClose}
          ></div>
        </div>
    );
};

export default InfoModal;
