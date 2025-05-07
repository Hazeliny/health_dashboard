import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import InfoModal from './InfoModal'
import TrendPanel from './TrendPanel'

// Register Chart.js plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
)

const LegendBlock = () => (
  <div className="absolute right-2 flex flex-col items-start space-y-0 text-xs">
    <div className="flex items-center space-x-1"><div className="w-3 h-2 bg-red-500 rounded-sm" /><span>Above Normal</span></div>
    <div className="flex items-center space-x-1"><div className="w-3 h-2 bg-yellow-300 rounded-sm" /><span>Below Normal</span></div>
    <div className="flex items-center space-x-1"><div className="w-3 h-2 bg-blue-500 rounded-sm" /><span>Normal</span></div>
  </div>
)

const TrendIcon = ({ onClick }) => (
  <button
    className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 text-sm z-10 flex items-center justify-center"
    title="View historical trend"
    onClick={onClick}
    style={{ width: '36px', height: '26px', padding: 0, lineHeight: 1 }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="3 18 9 11 13 15 21 8" />
      <circle cx="3" cy="18" r="1" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="13" cy="15" r="1" />
      <circle cx="21" cy="8" r="1" />
    </svg>
  </button>
)

export default function SensorChart({ data, patientId }) {
  const [openModal, setOpenModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [openTrend, setOpenTrend] = useState(false)
  const [selectedTrendMetric, setSelectedTrendMetric] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [trendRange, setTrendRange] = useState('24h')

  useEffect(() => {
    if (openTrend && selectedTrendMetric) {
      fetchTrendData(selectedTrendMetric, trendRange)
    }
  }, [trendRange])

  const handleCardClick = (metricKey) => {
    setSelectedMetric(metricKey)
    setOpenModal(true)
  }

  const fetchTrendData = async (metricKey, range) => {
    const url = `/api/trend-data?metric=${metricKey}&patientId=${patientId}&range=${range}`;
    console.log("🔍 Fetching trend data from:", url); 

    try {
      const res = await fetch(`/api/trend-data?metric=${metricKey}&patientId=${patientId}&range=${range}`)
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
      const json = await res.json()
      setTrendData(json)
      console.log("Fetched trend data: ", json)
    } catch (err) {
      console.error("Failed to fetch trend data: ", err)
      setTrendData([])
    }
  }

  const handleTrendClick = async (metricKey) => {
    setSelectedTrendMetric(metricKey)
    setTrendRange('24h')
    setOpenTrend(true)
    await fetchTrendData(metricKey, '24h')
/*
    try {
      // Fetch tren data from backend API // If the frontend and backend are in the same domain/resource
      const res = await fetch(`/api/trend-data?metric=${metricKey}&patientId=${patientId}`) //Handle error
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
        const data = await res.json()
        setTrendData(data)
        setOpenTrend(true)
        console.log("Fetched trend data: ", data)
      } catch(err) {
        console.error("Failed to load trend data JSON: ", err)
    }
    // If different servers or different ports are deployed between frontend and backend or HTTPS is used, complete path is mandatory
    //const response = await fetch(`https://localhost:8443/api/trend-data?metric=xxx&patientId=xxx`)
*/
  }

  const cards = [
    {
      key: 'temperature',
      title: 'Temperature (°C)',
      value: data.temperature,
      unit: '°C',
      color: '#60a5fa',
      min: 36.1,
      max: 37.2,
    },
    {
      key: 'heartRate',
      title: 'Heart Rate (bpm)',
      value: data.heartRate,
      unit: 'bpm',
      color: '#34d399',
      min: 60,
      max: 100,
    },
    {
      key: 'bloodPressure',
      title: 'Blood Pressure\n(mmHg)',
      value: {
        systolic: data.bloodPressure?.systolic,
        diastolic: data.bloodPressure?.diastolic,
      },
      unit: 'mmHg',
      color: '#f87171',
      min: { systolic: 90, diastolic: 60 }, // Reasonable lower limit of blood pressure
      max: { systolic: 140, diastolic: 90 }, // Reasonable upper limit of blood pressure
    },
    {
      key: 'oxygenSaturation',
      title: 'Oxygen Saturation (HbO₂/(HbO₂ + Hb)%)',
      value: data.oxygenSaturation,
      unit: '%',
      color: '#fbbf24',
      min: 95,
      max: 100,
    },
    {
      key: 'respiratoryRate',
      title: 'Respiratory Rate (breaths/min)',
      value: data.respiratoryRate,
      unit: 'breaths/min',
      color: '#a78bfa',
      min: 12,
      max: 20,
    },
    {
      key: 'bloodGlucose',
      title: 'Blood Glucose\n(mmol/L)',
      value: data.bloodGlucose,
      unit: 'mmol/L',
      color: '#fb923c',
      min: 3.9,
      max: 6.1,
    },
  ]

  const getColor = (value, min, max) => {
    if (value > max) return 'red'
    if (value < min) return 'yellow'
    return '#3b82f6' //blue
  }

  return (
    <div className="relative">
      <InfoModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        data={data}
        metric={selectedMetric}
      />
      <TrendPanel
        open={openTrend}
        onClose={() => setOpenTrend(false)}
        data={trendData}
        metric={selectedTrendMetric}
        range={trendRange}
        setRange={setTrendRange}
      />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1 bg-gray-100 shadow rounded">
      {cards.map((card, index) => {
        const isBloodPressure = card.title.includes('Blood Pressure')

        if (isBloodPressure) {
          // Specially deal with bloodpressure card
          const systolicValue = card.value.systolic
          const diastolicValue = card.value.diastolic

          const bloodPressureCharts = [
            { label: 'Systolic', value: systolicValue, min: card.min.systolic, max: card.max.systolic },
            { label: 'Diastolic', value: diastolicValue, min: card.min.diastolic, max: card.max.diastolic },
          ]

          return (
            <div key={index} 
              className="group p-4 border rounded shadow-sm relative cursor-pointer hover:shadow-lg hover:border-blue-600 transition" onClick={() => handleCardClick(card.key)}
              title="Click to view visual monitor"
              >
              {/* Title */}
              <h4 className="text-lg font-semibold mb-0 whitespace-pre-line">{card.title}</h4>

              {/* Vertical legend in the upper right corner */}
              <LegendBlock />

              {/* 📈 Historical trend icon button */}
              <TrendIcon onClick={(e) => { e.stopPropagation(); handleTrendClick(card.key) }} />

              {/* Two small bloodPressure bars */}
              <div className="grid grid-cols-2.5 gap-0.5 mt-11">
                {bloodPressureCharts.map((item, subIndex) => {
                  const chartData = {
                    labels: [item.label],
                    datasets: [
                      {
                        label: item.label,
                        data: [item.value],
                        backgroundColor: getColor(item.value, item.min, item.max),
                        borderRadius: 8,
                        barThickness: 26,
                      },
                    ],
                  }

                  const options = {
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                      annotation: {
                        annotations: {
                          maxLine: {
                            type: 'line',
                            yMin: item.max,
                            yMax: item.max,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                              enabled: true,
                              content: `Max ${item.max}${card.unit}`,
                              position: 'start',
                            },
                          },
                          minLine: {
                            type: 'line',
                            yMin: item.min,
                            yMax: item.min,
                            borderColor: 'yellow',
                            borderWidth: 2,
                            label: {
                              enabled: true,
                              content: `Min ${item.min}${card.unit}`,
                              position: 'start',
                            },
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                      },
                      y: {
                        title: {
                          display: true,
                          text: card.unit,
                        },
                        suggestedMin: 0,
                      },
                    },
                    layout: {
                      padding: {
                      top: 28, // Add space to the top of the chart area
                      bottom: 0, // Add space to the bottom of the chart area
                      left: -6, // Add space to the left of the chart area
                      },
                    },
                  }

                  return (
                    <div key={subIndex} className="h-50 w-56" style={{ marginTop: '30px' }}>
                      <Bar data={chartData} options={options} />
                      {/* Values shown below */}
                      <div className="text-center mt-1 text-sm text-gray-600">
                        {item.value} {card.unit}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        } else {
          // Handle all the cards except for bloodPressure card
          const chartData = {
            labels: [card.title],
            datasets: [
              {
                label: card.title,
                data: [card.value],
                backgroundColor: getColor(card.value, card.min, card.max),
                borderRadius: 8,
                barThickness: 26,
              },
            ],
          }

          const options = {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
              annotation: {
                annotations: {
                  maxLine: {
                    type: 'line',
                    yMin: card.max,
                    yMax: card.max,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                      enabled: true,
                      content: `Max: ${card.max}${card.unit}`,
                      position: 'start',
                    },
                  },
                  minLine: {
                    type: 'line',
                    yMin: card.min,
                    yMax: card.min,
                    borderColor: 'yellow',
                    borderWidth: 2,
                    label: {
                      enabled: true,
                      content: `Min: ${card.min}${card.unit}`,
                      position: 'start',
                    },
                  },
                },
              },
            },
            scales: {
              x: {
                display: false,
              },
              y: {
                title: {
                  display: true,
                  text: card.unit,
                },
                suggestedMin: 0,
              },
            },
            layout: {
              padding: {
                top: 0,
                bottom: 0,
                left: -6,
              },
            },
          }

          return (
            <div key={index} className="group p-4 border rounded shadow-sm relative cursor-pointer hover:shadow-lg hover:border-blue-600 transition" onClick={() => handleCardClick(card.key)}
              title="Click to view visual monitor"
            >
              <h4 className="text-lg font-semibold mb-4 whitespace-pre-line">{card.title}</h4>

              {/* Vertical legend in the upper right croner */}
              <LegendBlock />

              {/* 📈 Historical trend icon button */}
              <TrendIcon onClick={(e) => { e.stopPropagation(); handleTrendClick(card.key) }} />

              <div className="h-50 w-30" style={{ marginTop: '120px' }}>
                <Bar data={chartData} options={options} />
              </div>

              {/* Data shown below */}
              <div className="text-center mt-3 text-sm text-gray-600">
                {card.value} {card.unit}
              </div>
            </div>
          )
        }
      })}
    </div>
    </div>
  )
}
