import pool from '../config/db.js';

const listVehicles = async (req, res) => {
    const { page = 1, limit = 20, status, vendor_id } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT v.*, ve.company as vendor_name FROM vehicles v LEFT JOIN vendors ve ON v.vendor_id = ve.id WHERE 1=1';
        const queryParams = [];

        if (status) {
            query += ' AND v.status = ?';
            queryParams.push(status);
        }

        if (vendor_id) {
            query += ' AND v.vendor_id = ?';
            queryParams.push(vendor_id);
        }
        
        const [totalResult] = await pool.query(query.replace('SELECT v.*, ve.company as vendor_name', 'SELECT COUNT(*) as total'), queryParams);
        const total = totalResult[0].total;

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [vehicles] = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: vehicles,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: 'Vehicles retrieved successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getVehiclesByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const [vehicles] = await pool.query('SELECT id, license_plate, status FROM vehicles WHERE status = ?', [status]);
        res.json({
            success: true,
            data: vehicles,
            total: vehicles.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        const [vehicles] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
        if (vehicles.length === 0) {
            return res.status(404).json({ success: false, error: 'Vehicle not found', statusCode: 404 });
        }
        res.json({ success: true, data: vehicles[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const createVehicle = async (req, res) => {
    const { vendor_id, vehicle_class, brand, model, year, license_plate, vin, seating_capacity, fuel_type, registration_date, registration_expiry, insurance_expiry } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO vehicles (vendor_id, vehicle_class, brand, model, year, license_plate, vin, seating_capacity, fuel_type, registration_date, registration_expiry, insurance_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [vendor_id, vehicle_class, brand, model, year, license_plate, vin, seating_capacity, fuel_type, registration_date, registration_expiry, insurance_expiry]
        );
        const vehicleId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: vehicleId, license_plate, brand, status: 'Inactive' },
            message: 'Vehicle created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { assigned_driver_id, insurance_expiry } = req.body;
    try {
        await pool.query('UPDATE vehicles SET assigned_driver_id = ?, insurance_expiry = ? WHERE id = ?', [assigned_driver_id, insurance_expiry, id]);
        const [vehicles] = await pool.query('SELECT id, license_plate, assigned_driver_id, updated_at FROM vehicles WHERE id = ?', [id]);
        res.json({
            success: true,
            data: vehicles[0],
            message: 'Vehicle updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateVehicleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE vehicles SET status = ? WHERE id = ?', [status, id]);
        const [vehicles] = await pool.query('SELECT id, status, updated_at FROM vehicles WHERE id = ?', [id]);
        res.json({
            success: true,
            data: vehicles[0],
            message: 'Vehicle status updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { listVehicles, getVehiclesByStatus, createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle, getVehicleById };
