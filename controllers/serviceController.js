import pool from '../config/db.js';

const listServices = async (req, res) => {
    try {
        const [services] = await pool.query('SELECT * FROM services');
        res.json({ success: true, data: services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const [services] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
        if (services.length === 0) {
            return res.status(404).json({ success: false, error: 'Service not found', statusCode: 404 });
        }
        res.json({ success: true, data: services[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const createService = async (req, res) => {
    const { name, description, price } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
            [name, description, price]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name }, message: 'Service created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
        await pool.query(
            'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?',
            [name, description, price, id]
        );
        res.json({ success: true, message: 'Service updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateServiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE services SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Service status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM services WHERE id = ?', [id]);
        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { listServices, getServiceById, createService, updateService, deleteService, updateServiceStatus };
