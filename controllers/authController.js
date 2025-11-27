import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { generateRandomPassword } from '../utils/auth.js';

const register = async (req, res) => {
  const { email, full_name, company_name, role, phone, address } = req.body;

  if (!email || !full_name || !company_name || !role) {
    return res.status(400).json({
      success: false,
      error: 'Email, full name, company name, and role are required',
      statusCode: 400
    });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        statusCode: 409
      });
    }

    const username = email.split('@')[0];
    const password = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, company_name, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, company_name, role, phone, address]
    );
    const userId = result.insertId;

    // In a real app, you would send an email with the password.
    // For now, we return it in the response for development purposes.
    res.status(201).json({
      success: true,
      data: {
        user_id: userId,
        email: email,
        username: username,
        full_name: full_name,
        role: role,
        company_name: company_name,
        status: 'Pending',
        default_password: password,
        credentials: {
          username: username,
          password: password
        },
        message: 'Account created successfully'
      },
      notification: `Verification email sent to ${email}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
  }
};

const login = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      error: 'Username, password, and role are required',
      statusCode: 400
    });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND role = ?', [username, role]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
        statusCode: 401
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
        statusCode: 401
      });
    }
    
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h'
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
          password_changed: user.password_changed
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, full_name, role, phone, address, status, password_changed, company_name FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
  }
};

const updateProfile = async (req, res) => {
    const { full_name, phone, address } = req.body;
    try {
        await pool.query('UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?', [full_name, phone, address, req.user.id]);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


const logout = (req, res) => {
    // For JWT, logout is typically handled on the client-side by deleting the token.
    // We can add a server-side blacklist for tokens if needed.
    res.json({ success: true, message: 'Logged out successfully' });
};


// These are stubs for now, will be implemented later
const verifyEmail = (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented', statusCode: 501 });
};

const changePassword = (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented', statusCode: 501 });
};


export { register, login, getProfile, updateProfile, logout, verifyEmail, changePassword };