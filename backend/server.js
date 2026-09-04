// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast on Vercel if unable to connect
    });
    console.log('Enterprise MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    throw err;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Active', message: 'AgriSync Core API is running' });
});
// Upar imports ke sath add karein
const verifyToken = require('./src/middlewares/auth');
const bookingRoutes = require('./src/routes/booking');
const userRoutes = require('./src/routes/user');
const advisoryRoutes = require('./src/routes/advisory');
const insightsRoutes = require('./src/routes/insights');

// Ek naya secure route add karein
app.get('/api/auth/verify', verifyToken, (req, res) => {
  // Agar code yahan tak pahuncha, matlab token 100% valid hai
  res.status(200).json({ 
    success: true, 
    message: 'Backend successfully authenticated user!',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

// Register booking routes
app.use('/api/bookings', bookingRoutes);
// Register user routes
app.use('/api/users', userRoutes);
// Register notification routes
const notificationRoutes = require('./src/routes/notification');
app.use('/api/notifications', notificationRoutes);
// Register advisory routes
app.use('/api/advisory', advisoryRoutes);
app.use('/api/insights', insightsRoutes);
// Register admin routes
const adminRoutes = require('./src/routes/admin');
app.use('/api/admin', adminRoutes);

const axios = require('axios');

// Mock Mandis data
const MOCK_MANDIS = [
  { id: 1, name: "Kanpur Central Mandi", lat: 26.4609, lng: 80.3217, capacity: 5000, available: 1200 },
  { id: 2, name: "Akbarpur Krishi Mandi", lat: 26.4398, lng: 80.0173, capacity: 3000, available: 850 },
  { id: 3, name: "Bilhaur Wholesale Market", lat: 26.7456, lng: 80.0448, capacity: 2000, available: 400 },
  { id: 4, name: "Unnao Sub Mandi", lat: 26.5401, lng: 80.4883, capacity: 1500, available: 200 },
];

// Mock Trucks data
const generateMockTrucks = (lat, lng) => {
  return [
    { id: 101, driverName: "Ramesh Singh", vehicleNumber: "UP78 BT 1234", type: "Open Body (10T)", capacity: 100, lat: lat + 0.015, lng: lng + 0.02, pricePerKm: 25 },
    { id: 102, driverName: "Suresh Kumar", vehicleNumber: "UP32 AC 9988", type: "Temperature Controlled", capacity: 50, lat: lat - 0.02, lng: lng - 0.01, pricePerKm: 40 },
    { id: 103, driverName: "Abdul Rehman", vehicleNumber: "UP78 CV 5566", type: "Mini Truck (TATA Ace)", capacity: 20, lat: lat + 0.005, lng: lng - 0.025, pricePerKm: 15 },
  ];
};

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

app.get('/api/logistics/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    // 1. Calculate distances to all mandis
    const mandisWithDistance = MOCK_MANDIS.map(mandi => {
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), mandi.lat, mandi.lng);
      return { ...mandi, distance: parseFloat(distance.toFixed(1)) };
    });

    // 2. Sort by distance
    mandisWithDistance.sort((a, b) => a.distance - b.distance);

    // Mark the closest one as optimal
    if (mandisWithDistance.length > 0) {
      mandisWithDistance[0].optimal = true;
    }

    // 3. Fetch Weather from OpenWeatherMap
    let weatherData = null;
    const apiKey = process.env.WEATHER_API_KEY;
    if (apiKey) {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`);
        weatherData = {
          temp: response.data.main.temp,
          humidity: response.data.main.humidity,
          condition: response.data.weather[0].main,
          description: response.data.weather[0].description,
          location: response.data.name
        };
      } catch (weatherErr) {
        console.error("Weather API error:", weatherErr.message);
      }
    }

    // 4. Generate Nearby Trucks
    const trucksWithDistance = generateMockTrucks(parseFloat(lat), parseFloat(lng)).map(truck => {
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), truck.lat, truck.lng);
      return { ...truck, distance: parseFloat(distance.toFixed(1)) };
    }).sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      weather: weatherData,
      mandis: mandisWithDistance.slice(0, 5), // Return top 5 closest
      trucks: trucksWithDistance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const TruckBooking = require('./src/models/TruckBooking');

// Create a new Truck Booking
app.post('/api/logistics/book-truck', verifyToken, async (req, res) => {
  try {
    const { truckId, driverName, vehicleNumber, cropType, quantity, pickupLocation, destinationMandi, cost } = req.body;
    
    if (!truckId || !cropType || !quantity || !pickupLocation || !destinationMandi || !cost) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newBooking = new TruckBooking({
      farmerId: req.user.uid,
      truckId,
      driverName,
      vehicleNumber,
      cropType,
      quantity,
      pickupLocation,
      destinationMandi,
      cost,
      timeline: [
        {
          status: 'PENDING',
          description: 'Booking request sent to logistics provider.'
        }
      ]
    });

    const savedBooking = await newBooking.save();

    // Create Notification
    const Notification = require('./src/models/Notification');
    await Notification.create({
      userId: req.user.uid,
      type: 'info',
      title: 'Truck Booked',
      message: `Your truck (${vehicleNumber}) booking to transport ${quantity} Qtl of ${cropType} from ${pickupLocation} to ${destinationMandi} is confirmed.`,
    });

    res.status(201).json({
      success: true,
      message: 'Truck booked successfully!',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error booking truck:', error);
    res.status(500).json({ error: 'Failed to book truck.' });
  }
});

// Get User's Truck Bookings
app.get('/api/logistics/my-trucks', verifyToken, async (req, res) => {
  try {
    const bookings = await TruckBooking.find({ farmerId: req.user.uid }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching truck bookings:', error);
    res.status(500).json({ error: 'Failed to fetch truck bookings.' });
  }
});

// Update Truck Status
app.put('/api/logistics/book-truck/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await TruckBooking.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.uid },
      { 
        $set: { status },
        $push: {
          timeline: {
            status,
            description: req.body.description || `Status updated to ${status}`
          }
        }
      },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Create Notification
    const Notification = require('./src/models/Notification');
    let title = 'Truck Status Updated';
    let message = `Your truck (${booking.vehicleNumber}) status is now ${status}.`;
    let type = 'info';

    if (status === 'IN_TRANSIT') {
      title = 'Truck Onboard / In Transit';
      message = `Your truck (${booking.vehicleNumber}) has picked up the cargo and is en route to ${booking.destinationMandi}.`;
    } else if (status === 'DELIVERED') {
      title = 'Delivery Completed';
      message = `Your truck (${booking.vehicleNumber}) has successfully delivered your cargo to ${booking.destinationMandi}.`;
      type = 'success';
    }

    await Notification.create({
      userId: req.user.uid,
      type,
      title,
      message,
    });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error('Error updating truck status:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});


const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server initialized on port ${PORT}`);
  });
}

module.exports = app;