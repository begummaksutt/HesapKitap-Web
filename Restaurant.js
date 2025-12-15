const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    image: {
        type: String
    },
    menu: [{
        name: String,
        price: Number,
        description: String
    }],
    isStarRestaurant: {
        type: Boolean,
        default: false
    },
    isDiscounted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema); 