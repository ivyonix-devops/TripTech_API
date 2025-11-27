import pool from '../config/db.js';

const listOwners = async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM trip_owners WHERE 1=1';
        const queryParams = [];

        if (status) {
            query += ' AND status = ?';
            queryParams.push(status);
        }

        const [totalResult] = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), queryParams);
        const total = totalResult[0].total;

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [owners] = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: owners,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            message: 'Trip owners retrieved successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getOwnerById = async (req, res) => {
    const { id } = req.params;
    try {
        const [owners] = await pool.query('SELECT * FROM trip_owners WHERE id = ?', [id]);
        if (owners.length === 0) {
            return res.status(404).json({ success: false, error: 'Trip owner not found', statusCode: 404 });
        }
        res.json({ success: true, data: owners[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const createOwner = async (req, res) => {
    const { company, contact_person, email, phone, type, address, city, country, postal_code, registration_number, tax_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO trip_owners (company, contact_person, email, phone, type, address, city, country, postal_code, registration_number, tax_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company, contact_person, email, phone, type, address, city, country, postal_code, registration_number, tax_id]
        );
        const ownerId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: ownerId, company, status: 'Inactive' },
            message: 'Trip owner created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateOwner = async (req, res) => {
    const { id } = req.params;
    const { contact_person, email, phone } = req.body;
    try {
        await pool.query('UPDATE trip_owners SET contact_person = ?, email = ?, phone = ? WHERE id = ?', [contact_person, email, phone, id]);
        const [owners] = await pool.query('SELECT id, company, contact_person, email, updated_at FROM trip_owners WHERE id = ?', [id]);
        res.json({
            success: true,
            data: owners[0],
            message: 'Trip owner updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateOwnerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE trip_owners SET status = ? WHERE id = ?', [status, id]);
        const [owners] = await pool.query('SELECT id, status, updated_at FROM trip_owners WHERE id = ?', [id]);
        res.json({
            success: true,
            data: owners[0],
            message: 'Trip owner status updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteOwner = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM trip_owners WHERE id = ?', [id]);
        res.json({ success: true, message: 'Trip owner deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { listOwners, getOwnerById, createOwner, updateOwner, updateOwnerStatus, deleteOwner };
