const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Tüm restoranları getir
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Yıldızlı restoranları getir
router.get('/starred', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isStarRestaurant: true });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// İndirimli restoranları getir
router.get('/discounted', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isDiscounted: true });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mutfak türüne göre restoranları getir
router.get('/cuisine/:type', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ cuisine: req.params.type });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Yeni restoran ekle
router.post('/', async (req, res) => {
    const restaurant = new Restaurant(req.body);
    try {
        const newRestaurant = await restaurant.save();
        res.status(201).json(newRestaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Restoran güncelle
router.put('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(restaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Restoran sil
router.delete('/:id', async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Restoran başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 