import pool from '../config/db.js';

const listDrivers = async (req, res) => {
    const { page = 1, limit = 20, status, available } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM drivers WHERE 1=1';
        const queryParams = [];

        if (status) {
            query += ' AND status = ?';
            queryParams.push(status);
        }

        if (available) {
            query += ' AND is_available = ?';
            queryParams.push(available === 'true');
        }

        const [totalResult] = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), queryParams);
        const total = totalResult[0].total;

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [drivers] = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: drivers,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: 'Drivers retrieved successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getAvailableDrivers = async (req, res) => {
    try {
        const [drivers] = await pool.query('SELECT id, first_name, last_name, email, phone, license_number, license_expiry, status FROM drivers WHERE is_available = TRUE AND status = "Active"');
        res.json({
            success: true,
            data: drivers,
            total: drivers.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const [drivers] = await pool.query('SELECT * FROM drivers WHERE id = ?', [id]);
        if (drivers.length === 0) {
            return res.status(404).json({ success: false, error: 'Driver not found', statusCode: 404 });
        }
        res.json({ success: true, data: drivers[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


const createDriver = async (req, res) => {
    const { first_name, last_name, email, phone, license_number, license_expiry, license_class, date_of_birth, address, city, country, emergency_contact, emergency_phone } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO drivers (first_name, last_name, email, phone, license_number, license_expiry, license_class, date_of_birth, address, city, country, emergency_contact, emergency_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, license_number, license_expiry, license_class, date_of_birth, address, city, country, emergency_contact, emergency_phone]
        );
        const driverId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: driverId, first_name, last_name, status: 'Active' },
            message: 'Driver created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateDriver = async (req, res) => {
    const { id } = req.params;
    const { phone, license_expiry } = req.body;
    try {
        await pool.query('UPDATE drivers SET phone = ?, license_expiry = ? WHERE id = ?', [phone, license_expiry, id]);
        const [drivers] = await pool.query('SELECT id, first_name, phone, updated_at FROM drivers WHERE id = ?', [id]);
        res.json({
            success: true,
            data: drivers[0],
            message: 'Driver updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteDriver = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM drivers WHERE id = ?', [id]);
        res.json({ success: true, message: 'Driver deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


export { listDrivers, getAvailableDrivers, createDriver, updateDriver, deleteDriver, getDriverById };
