const port = process.env.PORT || 8080; //In orde to be adapted to Azure
const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
const WebSocket = require('ws');
const url = require('url'); // import this modul to parse and connect URL
const { MongoClient } = require('mongodb');
//const uri = 'mongodb://localhost:27017'; // Replace with my MongoDB URI
//const uri = 'mongodb+srv://user_liny:67EZGSaD1yXSQKtm@cluster0.1jh6ohl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

//const wss = new WebSocket.Server({ port: 8080 });
const wss = new WebSocket.Server({ server });

// Generate a random set of sensor data
function generateSensorData(patientId) {
  return {
    patientId, // patientId is added
    temperature: (30 + Math.random() * 12).toFixed(1), // 30°C - 42°C
    heartRate: Math.floor(38 + Math.random() * 83),    // 38 - 120 bpm
    bloodPressure: {
      systolic: Math.floor(70 + Math.random() * 81),   // 70 - 150 mmHg
      diastolic: Math.floor(50 + Math.random() * 51),   // 50 - 100 mmHg
    },
    oxygenSaturation: Math.floor(80 + Math.random() * 21), // 80% - 100%
    respiratoryRate: Math.floor(8 + Math.random() * 18),  // 8 - 25 breaths/min
    bloodGlucose: (Math.floor(Math.random() * 71) + 20) / 10, // 2.0 ≤ x < 9.0 mg/dL
    timestamp: new Date().toISOString(), // Send a timestamp (for frontend processing)
  };
}

async function run() {
  await client.connect();
  const db = client.db('sensorData');
  const collection = db.collection('metrics');

  // Ensure capped collection
  const collections = await db.listCollections({ name: 'metrics' }).toArray();
  if (collections.length === 0) {
    await db.createCollection('metrics', {
      capped: true,
      size: 5242880, // 5MB
      max: 360, // Maximum 360 records
    });
  }

// Everytime a client connects
wss.on('connection', (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const patientId = queryParams.patientId || 'unknown';
  console.log(`Client connected for patientId: ${patientId}`);

  // Send new random sensor data every 3sec
  const interval = setInterval(async () => {
    const sensorData = generateSensorData(patientId);
    ws.send(JSON.stringify(sensorData)); // Send to frontend
    // Insert into MongoDB
    await collection.insertOne(sensorData);
  }, 3000);

  // Clear the timer when the client disconnects
  ws.on('close', () => {
    console.log(`Client disconnected (patientId: ${patientId})`);
    clearInterval(interval);
  });
});

app.use(cors({
  origin: 'https://yellow-desert-0928ad103.6.azurestaticapps.net',
}));

app.get('/api/trend-data', async (req, res) => {
  const { metric, patientId, range = '24h' } = req.query;

  if (!metric || !patientId) {
    return res.status(400).json({ error: 'Missing metric or patientId' });
  }

  const now = new Date();
  let startTime = new Date(now);

  if (range === '7d') {
    startTime.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    startTime.setDate(now.getDate() - 30);
  } else {
    startTime.setHours(now.getHours() - 24);
  }

  try {
    const cursor = collection.find({
      patientId,
      timestamp: { $gte: startTime.toISOString() },
    }).sort({ timestamp: 1 });

    const result = [];
    for await (const doc of cursor) {
      let value;
      // Special handling for bloodPressure
      if (metric === 'bloodPressure') {
        value = doc.bloodPressure;
      } else {
        value = doc[metric];
      }
      if (value !== undefined) {
        result.push({
          timestamp: doc.timestamp,
          value,
        });
      }
      /* another alternative: expand the structure of bloodPressure object at backend instead of at frontend
      if (metric === 'bloodPressure') {
        value = doc.bloodPressure;
        if (value?.systolic && value?.diastolic) {
          result.push({
            timestamp: doc.timestamp,
            systolic: value.systolic,
            diastolic: value.diastolic,
          });
        }
      } else {
        value = doc[metric];
        if (value !== undefined) {
          result.push({
            timestamp: doc.timestamp,
            value,
          });
        }
      }
      */
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  server.listen(port, () => {
      console.log(`Mock sensor WebSocket server is running on port ${port}`);
  });
}

run().catch(console.error);
