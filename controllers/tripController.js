import pool from '../config/db.js';

const listTrips = async (req, res) => {
    const { page = 1, limit = 20, status, owner_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT 
                t.id, t.trip_id, t.origin_location, t.destination_location, t.scheduled_date, t.scheduled_time, t.trip_type, 
                t.status, t.passengers_count, t.distance_km, t.created_at,
                tow.company as owner_company,
                v.company as vendor_company,
                veh.license_plate as vehicle_license_plate,
                CONCAT(d.first_name, ' ', d.last_name) as driver_name
            FROM trips t
            LEFT JOIN trip_owners tow ON t.trip_owner_id = tow.id
            LEFT JOIN vendors v ON t.vendor_id = v.id
            LEFT JOIN vehicles veh ON t.vehicle_id = veh.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            WHERE 1=1
        `;
        const queryParams = [];

        if (status) {
            query += ' AND t.status = ?';
            queryParams.push(status);
        }
        if (owner_id) {
            query += ' AND t.trip_owner_id = ?';
            queryParams.push(owner_id);
        }
        if (start_date) {
            query += ' AND t.scheduled_date >= ?';
            queryParams.push(start_date);
        }
        if (end_date) {
            query += ' AND t.scheduled_date <= ?';
            queryParams.push(end_date);
        }
        
        const [totalResult] = await pool.query(query.replace(/SELECT(.|\n)*?FROM/s, 'SELECT COUNT(*) as total FROM'), queryParams);
        const total = totalResult[0].total;

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [trips] = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: trips,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: 'Trips retrieved successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getTripById = async (req, res) => {
    const { id } = req.params;
    try {
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ?', [id]);
        if (trips.length === 0) {
            return res.status(404).json({ success: false, error: 'Trip not found', statusCode: 404 });
        }
        const trip = trips[0];
        const [costs] = await pool.query('SELECT * FROM trip_costs WHERE trip_id = ?', [id]);
        const [incharges] = await pool.query('SELECT * FROM trip_incharges WHERE trip_id = ?', [id]);
        const [attachments] = await pool.query('SELECT * FROM trip_attachments WHERE trip_id = ?', [id]);
        trip.costs = costs;
        trip.incharges = incharges;
        trip.attachments = attachments;
        res.json({ success: true, data: trip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const createTrip = async (req, res) => {
    const { trip_owner_id, trip_type, origin_location, destination_location, scheduled_date, scheduled_time, estimated_duration, passengers_count, cargo_details, cargo_weight, special_requirements } = req.body;
    try {
        const trip_id = `TRIP${Date.now()}`;
        const [result] = await pool.query(
            'INSERT INTO trips (trip_id, trip_owner_id, trip_type, origin_location, destination_location, scheduled_date, scheduled_time, estimated_duration, passengers_count, cargo_details, cargo_weight, special_requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [trip_id, trip_owner_id, trip_type, origin_location, destination_location, scheduled_date, scheduled_time, estimated_duration, passengers_count, cargo_details, cargo_weight, special_requirements]
        );
        const tripId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: tripId, trip_id, status: 'Draft' },
            message: 'Trip created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateTrip = async (req, res) => {
    const { id } = req.params;
    const { vendor_id, vehicle_id, driver_id, scheduled_time, status } = req.body;
    try {
        await pool.query('UPDATE trips SET vendor_id = ?, vehicle_id = ?, driver_id = ?, scheduled_time = ?, status = ? WHERE id = ?', [vendor_id, vehicle_id, driver_id, scheduled_time, status, id]);
        const [trips] = await pool.query('SELECT id, trip_id, vendor_id, status, updated_at FROM trips WHERE id = ?', [id]);
        res.json({
            success: true,
            data: trips[0],
            message: 'Trip updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateTripStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE trips SET status = ? WHERE id = ?', [status, id]);
        const [trips] = await pool.query('SELECT id, status, updated_at FROM trips WHERE id = ?', [id]);
        res.json({
            success: true,
            data: trips[0],
            message: 'Trip status updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const addTripCost = async (req, res) => {
    const { id } = req.params;
    const { cost_type, description, amount, currency } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO trip_costs (trip_id, cost_type, description, amount, currency) VALUES (?, ?, ?, ?, ?)',
            [id, cost_type, description, amount, currency]
        );
        const costId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: costId, trip_id: id, cost_type, amount, status: 'Pending' },
            message: 'Trip cost added successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getTripCosts = async (req, res) => {
    const { id } = req.params;
    try {
        const [costs] = await pool.query('SELECT * FROM trip_costs WHERE trip_id = ?', [id]);
        const [totalResult] = await pool.query('SELECT SUM(amount) as total FROM trip_costs WHERE trip_id = ?', [id]);
        res.json({
            success: true,
            data: costs,
            total: totalResult[0].total || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteTrip = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM trips WHERE id = ?', [id]);
        res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


export { listTrips, getTripById, createTrip, updateTrip, updateTripStatus, addTripCost, getTripCosts, deleteTrip };
