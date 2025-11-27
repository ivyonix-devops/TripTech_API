import pool from '../config/db.js';

const listBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings');
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (bookings.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found', statusCode: 404 });
        }
        res.json({ success: true, data: bookings[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getBookingsByOwnerCompany = async (req, res) => {
    const { company } = req.params;
    try {
        const [bookings] = await pool.query(`
            SELECT b.* FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN trip_owners o ON u.id = o.id
            WHERE o.company = ?
        `, [company]);
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


const createBooking = async (req, res) => {
    const { trip_id, notes } = req.body;
    const { id: user_id } = req.user;
    try {
        const [result] = await pool.query(
            'INSERT INTO bookings (trip_id, user_id, notes) VALUES (?, ?, ?)',
            [trip_id, user_id, notes]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, trip_id, user_id }, message: 'Booking created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    try {
        await pool.query(
            'UPDATE bookings SET status = ?, notes = ? WHERE id = ?',
            [status, notes, id]
        );
        res.json({ success: true, message: 'Booking updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { listBookings, getBookingById, createBooking, updateBooking, deleteBooking, getBookingsByOwnerCompany };
