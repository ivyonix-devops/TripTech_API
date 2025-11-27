import pool from '../config/db.js';

const listOperationsTeam = async (req, res) => {
    try {
        const [team] = await pool.query('SELECT * FROM operations_team');
        res.json({ success: true, data: team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const addOperationsMember = async (req, res) => {
    const { name, email, phone, role } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO operations_team (name, email, phone, role) VALUES (?, ?, ?, ?)',
            [name, email, phone, role]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name, email, phone, role }, message: 'Operations member added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateOperationsMember = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    try {
        await pool.query(
            'UPDATE operations_team SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
            [name, email, phone, role, id]
        );
        res.json({ success: true, message: 'Operations member updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteOperationsMember = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM operations_team WHERE id = ?', [id]);
        res.json({ success: true, message: 'Operations member deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateOperationsMemberStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE operations_team SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Operations member status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


const listOwnerOperationsTeam = async (req, res) => {
    try {
        const [team] = await pool.query('SELECT * FROM owner_operations_team');
        res.json({ success: true, data: team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const addOwnerOperationsMember = async (req, res) => {
    const { owner_id, name, email, phone, role } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO owner_operations_team (owner_id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)',
            [owner_id, name, email, phone, role]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name, email, phone, role }, message: 'Owner operations member added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateOwnerOperationsMember = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    try {
        await pool.query(
            'UPDATE owner_operations_team SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
            [name, email, phone, role, id]
        );
        res.json({ success: true, message: 'Owner operations member updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteOwnerOperationsMember = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM owner_operations_team WHERE id = ?', [id]);
        res.json({ success: true, message: 'Owner operations member deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


export { 
    listOperationsTeam, 
    addOperationsMember, 
    updateOperationsMember, 
    deleteOperationsMember, 
    updateOperationsMemberStatus,
    listOwnerOperationsTeam,
    addOwnerOperationsMember,
    updateOwnerOperationsMember,
    deleteOwnerOperationsMember
};
