const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu email zaten kullanılıyor' });
        }

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcı kontrolü
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Geçersiz şifre' });
        }

        // JWT token oluşturma
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Kullanıcı bilgilerini güncelle
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Favori restoran ekle
router.post('/:id/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user.favoriteRestaurants.includes(req.body.restaurantId)) {
            user.favoriteRestaurants.push(req.body.restaurantId);
            await user.save();
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Favori restoranları getir
router.get('/:id/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('favoriteRestaurants');
        res.json(user.favoriteRestaurants);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 