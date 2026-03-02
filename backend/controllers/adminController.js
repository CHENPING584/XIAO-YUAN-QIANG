const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    // Mock admin credentials
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ id: 0, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, role: 'admin' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

exports.getPosts = async (req, res) => {
    const { status = 'pending', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const [rows] = await db.query(
            'SELECT p.*, u.nickname FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.status = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?',
            [status, parseInt(limit), parseInt(offset)]
        );
        const [count] = await db.query('SELECT COUNT(*) as total FROM posts WHERE status = ?', [status]);
        
        res.json({ list: rows, total: count[0].total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.auditPost = async (req, res) => {
    const { id, status, reject_reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await db.query(
            'UPDATE posts SET status = ?, reject_reason = ? WHERE id = ?',
            [status, reject_reason || null, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const [posts] = await db.query('SELECT COUNT(*) as count FROM posts');
        const [pending] = await db.query('SELECT COUNT(*) as count FROM posts WHERE status = "pending"');
        
        res.json({
            users: users[0].count,
            posts: posts[0].count,
            pending: pending[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
