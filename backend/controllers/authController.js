const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const appId = process.env.WX_APP_ID;
    const appSecret = process.env.WX_APP_SECRET;
    
    // In dev environment without real appid/secret, we can mock login for testing
    if (process.env.NODE_ENV === 'development' && code === 'mock_code') {
        const openid = 'mock_openid_123456';
        const [rows] = await db.execute('SELECT * FROM users WHERE openid = ?', [openid]);
        let user = rows[0];
        if (!user) {
            const [result] = await db.execute('INSERT INTO users (openid, nickname) VALUES (?, ?)', [openid, 'Test User']);
            user = { id: result.insertId, openid, nickname: 'Test User', role: 'user' };
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.json({ token, user });
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const response = await axios.get(url);
    const { openid, session_key, errcode, errmsg } = response.data;

    if (errcode) {
      return res.status(400).json({ error: errmsg });
    }

    // Find or create user
    const [rows] = await db.execute('SELECT * FROM users WHERE openid = ?', [openid]);
    let user = rows[0];

    if (!user) {
      const [result] = await db.execute('INSERT INTO users (openid) VALUES (?)', [openid]);
      user = { id: result.insertId, openid, role: 'user' };
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
    // Requires middleware to set req.user
    const { nickname, avatar_url } = req.body;
    const userId = req.user.id;
    
    try {
        await db.execute('UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?', [nickname, avatar_url, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
