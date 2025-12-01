import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import tripOwnerRoutes from './routes/tripOwnerRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import tripTypeRoutes from './routes/tripTypeRoutes.js';

dotenv.config();

const app = express();


app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/owners', tripOwnerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/invites', invitationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/trip-types', tripTypeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
