import pool from '../config/db.js';

const createTripType = async (req, res) => {
    const { trip_type, trip_name, triptype_status, triptype_remarks, created_by } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO trip_types (trip_type, trip_name, triptype_status, triptype_remarks, created_by) VALUES (?, ?, ?, ?, ?)',
            [trip_type, trip_name, triptype_status, triptype_remarks, created_by]
        );
        const [tripType] = await pool.query('SELECT * FROM trip_types WHERE id = ?', [result.insertId]);
        res.status(201).json({
            success: true,
            data: tripType[0],
            message: 'Trip type created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getAllTripTypes = async (req, res) => {
    try {
        const [tripTypes] = await pool.query('SELECT * FROM trip_types');
        res.json({
            success: true,
            data: tripTypes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getTripTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const [tripType] = await pool.query('SELECT * FROM trip_types WHERE id = ?', [id]);
        if (tripType.length === 0) {
            return res.status(404).json({ success: false, error: 'Trip type not found', statusCode: 404 });
        }
        res.json({
            success: true,
            data: tripType[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateTripType = async (req, res) => {
    const { id } = req.params;
    const { trip_type, trip_name, triptype_status, triptype_remarks } = req.body;
    try {
        await pool.query(
            'UPDATE trip_types SET trip_type = ?, trip_name = ?, triptype_status = ?, triptype_remarks = ? WHERE id = ?',
            [trip_type, trip_name, triptype_status, triptype_remarks, id]
        );
        const [tripType] = await pool.query('SELECT * FROM trip_types WHERE id = ?', [id]);
        res.json({
            success: true,
            data: tripType[0],
            message: 'Trip type updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteTripType = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM trip_types WHERE id = ?', [id]);
        res.json({ success: true, message: 'Trip type deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { createTripType, getAllTripTypes, getTripTypeById, updateTripType, deleteTripType };
