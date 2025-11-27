import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const sendInvite = async (req, res) => {
    const { recipient_email, send_to, manual_entry, lc_name, lc_company } = req.body;
    const { id: from_user_id, role: from_role } = req.user;

    if (from_role !== 'logistics') {
        return res.status(403).json({ success: false, error: 'Only Logistics Coordinators can send invites this way', statusCode: 403 });
    }

    try {
        const invitation_id = `INV-${from_user_id}-${Date.now()}`;
        const request_id = `REQ-${Date.now()}`;
        
        let from_name, from_company;
        const [users] = await pool.query('SELECT full_name, company_name FROM users WHERE id = ?', [from_user_id]);
        if(users.length > 0) {
            from_name = users[0].full_name;
            from_company = users[0].company_name;
        }


        let final_lc_name = lc_name;
        let final_lc_company = lc_company;

        if(!manual_entry) {
            final_lc_name = from_name;
            final_lc_company = from_company;
        }

        const [result] = await pool.query(
            'INSERT INTO invitations (invitation_id, request_id, from_user_id, from_role, to_email, send_to, manual_entry, lc_name, lc_company_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [invitation_id, request_id, from_user_id, from_role, recipient_email, send_to, manual_entry, final_lc_name, final_lc_company]
        );

        res.status(201).json({
            success: true,
            data: {
                invitation_id,
                request_id,
                from_user_id,
                from_name,
                from_email: req.user.email,
                recipient_email,
                lc_name: final_lc_name,
                lc_company: final_lc_company,
                send_to,
                manual_entry,
                status: 'Request_Sent',
            },
            message: 'Invite sent successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const sendInviteToLc = async (req, res) => {
    const { recipient_email } = req.body;
    const { id: from_user_id, role: from_role } = req.user;

    if (from_role !== 'owner' && from_role !== 'vendor') {
        return res.status(403).json({ success: false, error: 'Only Trip Owners or Vendors can send invites to Logistics Coordinators', statusCode: 403 });
    }

    try {
        const [lc_users] = await pool.query('SELECT id FROM users WHERE email = ? AND role = "logistics"', [recipient_email]);
        if(lc_users.length === 0) {
            return res.status(404).json({ success: false, error: 'Logistics Coordinator not registered', statusCode: 404 });
        }

        const invitation_id = `INV-${from_user_id}-${Date.now()}`;
        const request_id = `REQ-${Date.now()}`;
        
        const [users] = await pool.query('SELECT full_name FROM users WHERE id = ?', [from_user_id]);
        const from_name = users.length > 0 ? users[0].full_name : '';

        await pool.query(
            'INSERT INTO invitations (invitation_id, request_id, from_user_id, from_role, to_email, to_role) VALUES (?, ?, ?, ?, ?, ?)',
            [invitation_id, request_id, from_user_id, from_role, recipient_email, 'logistics']
        );

        res.status(201).json({
            success: true,
            data: {
                invitation_id,
                request_id,
                from_user_id,
                from_role,
                from_name,
                recipient_email,
                recipient_role: 'logistics',
                status: 'Request_Sent',
            },
            message: 'Invite sent to Logistics Coordinator'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const listInvites = async (req, res) => {
    const { id: userId, email: userEmail } = req.user;
    const { status, type, page = 1, limit = 10 } = req.query;

    try {
        let sentQuery = 'SELECT * FROM invitations WHERE from_user_id = ?';
        const sentParams = [userId];
        if(status) {
            sentQuery += ' AND status = ?';
            sentParams.push(status);
        }
        if(type) {
            sentQuery += ' AND invitation_type = ?';
            sentParams.push(type);
        }

        const [sent] = await pool.query(sentQuery, sentParams);

        let receivedQuery = 'SELECT * FROM invitations WHERE to_email = ?';
        const receivedParams = [userEmail];

        if(status) {
            receivedQuery += ' AND status = ?';
            receivedParams.push(status);
        }
        if(type) {
            receivedQuery += ' AND invitation_type = ?';
            receivedParams.push(type);
        }

        const [received] = await pool.query(receivedQuery, receivedParams);

        res.json({
            success: true,
            data: { sent, received },
            pagination: {
                total: sent.length + received.length,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getInviteById = async (req, res) => {
    const { invitation_id } = req.params;
    try {
        const [invites] = await pool.query('SELECT * FROM invitations WHERE invitation_id = ?', [invitation_id]);
        if (invites.length === 0) {
            return res.status(404).json({ success: false, error: 'Invitation not found', statusCode: 404 });
        }
        res.json({ success: true, data: invites[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const acceptInvite = async (req, res) => {
    const { invitation_id } = req.params;
    try {
        await pool.query('UPDATE invitations SET status = "Accepted", response_date = CURRENT_TIMESTAMP WHERE invitation_id = ?', [invitation_id]);
        res.json({
            success: true,
            message: 'Invitation accepted successfully',
            data: { invitation_id, status: 'Accepted' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const rejectInvite = async (req, res) => {
    const { invitation_id } = req.params;
    const { rejection_reason } = req.body;
    try {
        await pool.query('UPDATE invitations SET status = "Rejected", response_notes = ?, response_date = CURRENT_TIMESTAMP WHERE invitation_id = ?', [rejection_reason, invitation_id]);
        res.json({
            success: true,
            message: 'Invitation rejected',
            data: { invitation_id, status: 'Rejected' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteInvite = async (req, res) => {
    const { invitation_id } = req.params;
    const { id: from_user_id } = req.user;
    try {
        const [result] = await pool.query('DELETE FROM invitations WHERE invitation_id = ? AND from_user_id = ?', [invitation_id, from_user_id]);
        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, error: 'Only the sender can delete this invitation or invitation not found', statusCode: 403 });
        }
        res.json({ success: true, message: 'Invitation deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

export { sendInvite, sendInviteToLc, listInvites, getInviteById, acceptInvite, rejectInvite, deleteInvite };
