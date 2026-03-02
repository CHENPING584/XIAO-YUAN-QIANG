const db = require('../config/db');

exports.getPosts = async (req, res) => {
    const { category_id, page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
        SELECT p.*, u.nickname, u.avatar_url 
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.status = 'approved' 
    `;
    const params = [];

    if (category_id) {
        sql += ' AND p.category_id = ?';
        params.push(category_id);
    }
    
    // Add type filter if needed (e.g. lost/found)
    
    sql += ' ORDER BY p.is_top DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    try {
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostDetail = async (req, res) => {
    const { id } = req.params;
    try {
        // Update views
        await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
        
        const [post] = await db.query(`
            SELECT p.*, u.nickname, u.avatar_url, c.name as category_name
            FROM posts p 
            LEFT JOIN users u ON p.user_id = u.id 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        
        if (post.length === 0) return res.status(404).json({ error: 'Post not found' });
        
        // Get comments
        const [comments] = await db.query(`
            SELECT c.*, u.nickname, u.avatar_url 
            FROM comments c 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? AND c.status = 1
            ORDER BY c.created_at ASC
        `, [id]);

        res.json({ ...post[0], comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPost = async (req, res) => {
    const { category_id, content, images, contact_info, is_anonymous } = req.body;
    const userId = req.user.id; // From middleware

    try {
        // Check for sensitive content (mock)
        if (content.includes('敏感词')) {
            return res.status(400).json({ error: 'Content contains sensitive words' });
        }

        const [result] = await db.query(
            'INSERT INTO posts (user_id, category_id, content, images, contact_info, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, category_id, content, JSON.stringify(images || []), contact_info, is_anonymous ? 1 : 0]
        );
        
        res.json({ id: result.insertId, message: 'Post submitted for review' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.likePost = async (req, res) => {
    const { post_id } = req.body;
    const userId = req.user.id;
    
    try {
        // Check if liked
        const [existing] = await db.query('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [userId, post_id]);
        
        if (existing.length > 0) {
            // Unlike
            await db.query('DELETE FROM likes WHERE id = ?', [existing[0].id]);
            await db.query('UPDATE posts SET likes = likes - 1 WHERE id = ?', [post_id]);
            res.json({ liked: false });
        } else {
            // Like
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, post_id]);
            await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [post_id]);
            res.json({ liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.commentPost = async (req, res) => {
    const { post_id, content, parent_id, is_anonymous } = req.body;
    const userId = req.user.id;
    
    try {
        await db.query(
            'INSERT INTO comments (post_id, user_id, content, parent_id, is_anonymous) VALUES (?, ?, ?, ?, ?)',
            [post_id, userId, content, parent_id || null, is_anonymous ? 1 : 0]
        );
        await db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [post_id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyPosts = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await db.query(
            'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, parseInt(limit), parseInt(offset)]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
