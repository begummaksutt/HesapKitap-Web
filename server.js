const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/hesapkitap', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: '*', // Tüm kaynaklara izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..')));

// Session middleware
app.use(session({
    secret: 'hesapkitap-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // HTTPS kullanılmadığı için false
}));

// Sample data for restaurants
const sampleRestaurants = {
    'tavuk-doner': [
        {
            name: 'Popeyes',
            price: '₺149,90',
            url: 'https://www.popeyes.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺149,90' },
                { name: "3'lü Chicken Box", price: '₺179,90' },
                { name: "5'li Chicken Box", price: '₺249,90' },
                { name: 'Chicken Sandwich', price: '₺129,90' }
            ]
        },
        {
            name: 'KFC',
            price: '₺159,90',
            url: 'https://www.kfc.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺159,90' },
                { name: "3'lü Chicken Box", price: '₺189,90' },
                { name: "5'li Chicken Box", price: '₺259,90' },
                { name: 'Chicken Sandwich', price: '₺139,90' }
            ]
        },
        {
            name: 'Chicken House',
            price: '₺139,90',
            url: 'https://www.chickenhouse.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺139,90' },
                { name: "3'lü Chicken Box", price: '₺169,90' },
                { name: "5'li Chicken Box", price: '₺239,90' },
                { name: 'Chicken Sandwich', price: '₺119,90' }
            ]
        },
        {
            name: 'Chicken Master',
            price: '₺129,90',
            url: 'https://www.chickenmaster.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺129,90' },
                { name: "3'lü Chicken Box", price: '₺159,90' },
                { name: "5'li Chicken Box", price: '₺229,90' },
                { name: 'Chicken Sandwich', price: '₺109,90' }
            ]
        },
        {
            name: 'Chicken Time',
            price: '₺119,90',
            url: 'https://www.chickentime.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺119,90' },
                { name: "3'lü Chicken Box", price: '₺149,90' },
                { name: "5'li Chicken Box", price: '₺219,90' },
                { name: 'Chicken Sandwich', price: '₺99,90' }
            ]
        },
        {
            name: 'Chicken Express',
            price: '₺109,90',
            url: 'https://www.chickenexpress.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺109,90' },
                { name: "3'lü Chicken Box", price: '₺139,90' },
                { name: "5'li Chicken Box", price: '₺209,90' },
                { name: 'Chicken Sandwich', price: '₺89,90' }
            ]
        },
        {
            name: 'Chicken King',
            price: '₺99,90',
            url: 'https://www.chickenking.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺99,90' },
                { name: "3'lü Chicken Box", price: '₺129,90' },
                { name: "5'li Chicken Box", price: '₺199,90' },
                { name: 'Chicken Sandwich', price: '₺79,90' }
            ]
        },
        {
            name: 'Chicken Palace',
            price: '₺89,90',
            url: 'https://www.chickenpalace.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺89,90' },
                { name: "3'lü Chicken Box", price: '₺119,90' },
                { name: "5'li Chicken Box", price: '₺189,90' },
                { name: 'Chicken Sandwich', price: '₺69,90' }
            ]
        },
        {
            name: 'Chicken World',
            price: '₺79,90',
            url: 'https://www.chickenworld.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺79,90' },
                { name: "3'lü Chicken Box", price: '₺109,90' },
                { name: "5'li Chicken Box", price: '₺179,90' },
                { name: 'Chicken Sandwich', price: '₺59,90' }
            ]
        },
        {
            name: 'Chicken Land',
            price: '₺69,90',
            url: 'https://www.chickenland.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: "2'li Chicken Box", price: '₺69,90' },
                { name: "3'lü Chicken Box", price: '₺99,90' },
                { name: "5'li Chicken Box", price: '₺169,90' },
                { name: 'Chicken Sandwich', price: '₺49,90' }
            ]
        }
    ],
    'pizza': [
        {
            name: "Domino's Pizza",
            price: '₺199,90',
            url: 'https://www.dominos.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺199,90' },
                { name: 'Pepperoni', price: '₺219,90' },
                { name: 'Karışık', price: '₺239,90' },
                { name: 'Tavuklu', price: '₺229,90' }
            ]
        },
        {
            name: 'Pizza Hut',
            price: '₺189,90',
            url: 'https://www.pizzahut.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺189,90' },
                { name: 'Pepperoni', price: '₺209,90' },
                { name: 'Karışık', price: '₺229,90' },
                { name: 'Tavuklu', price: '₺219,90' }
            ]
        },
        {
            name: 'Pizza Express',
            price: '₺179,90',
            url: 'https://www.pizzaexpress.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺179,90' },
                { name: 'Pepperoni', price: '₺199,90' },
                { name: 'Karışık', price: '₺219,90' },
                { name: 'Tavuklu', price: '₺209,90' }
            ]
        },
        {
            name: 'Pizza Time',
            price: '₺169,90',
            url: 'https://www.pizzatime.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺169,90' },
                { name: 'Pepperoni', price: '₺189,90' },
                { name: 'Karışık', price: '₺209,90' },
                { name: 'Tavuklu', price: '₺199,90' }
            ]
        },
        {
            name: 'Pizza World',
            price: '₺159,90',
            url: 'https://www.pizzaworld.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺159,90' },
                { name: 'Pepperoni', price: '₺179,90' },
                { name: 'Karışık', price: '₺199,90' },
                { name: 'Tavuklu', price: '₺189,90' }
            ]
        },
        {
            name: 'Pizza Palace',
            price: '₺149,90',
            url: 'https://www.pizzapalace.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺149,90' },
                { name: 'Pepperoni', price: '₺169,90' },
                { name: 'Karışık', price: '₺189,90' },
                { name: 'Tavuklu', price: '₺179,90' }
            ]
        },
        {
            name: 'Pizza King',
            price: '₺139,90',
            url: 'https://www.pizzaking.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺139,90' },
                { name: 'Pepperoni', price: '₺159,90' },
                { name: 'Karışık', price: '₺179,90' },
                { name: 'Tavuklu', price: '₺169,90' }
            ]
        },
        {
            name: 'Pizza Master',
            price: '₺129,90',
            url: 'https://www.pizzamaster.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺129,90' },
                { name: 'Pepperoni', price: '₺149,90' },
                { name: 'Karışık', price: '₺169,90' },
                { name: 'Tavuklu', price: '₺159,90' }
            ]
        },
        {
            name: 'Pizza House',
            price: '₺119,90',
            url: 'https://www.pizzahouse.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺119,90' },
                { name: 'Pepperoni', price: '₺139,90' },
                { name: 'Karışık', price: '₺159,90' },
                { name: 'Tavuklu', price: '₺149,90' }
            ]
        },
        {
            name: 'Pizza Land',
            price: '₺109,90',
            url: 'https://www.pizzaland.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Margarita', price: '₺109,90' },
                { name: 'Pepperoni', price: '₺129,90' },
                { name: 'Karışık', price: '₺149,90' },
                { name: 'Tavuklu', price: '₺139,90' }
            ]
        }
    ],
    'kebap': [
        {
            name: 'Kebapçı İskender',
            price: '₺189,90',
            url: 'https://www.iskender.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺189,90' },
                { name: 'Adana Kebap', price: '₺159,90' },
                { name: 'Urfa Kebap', price: '₺159,90' },
                { name: 'Karışık Izgara', price: '₺199,90' }
            ]
        },
        {
            name: 'Kebapçı Halil',
            price: '₺179,90',
            url: 'https://www.kebapcihalil.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺179,90' },
                { name: 'Adana Kebap', price: '₺149,90' },
                { name: 'Urfa Kebap', price: '₺149,90' },
                { name: 'Karışık Izgara', price: '₺189,90' }
            ]
        },
        {
            name: 'Kebapçı Ali',
            price: '₺169,90',
            url: 'https://www.kebapciali.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺169,90' },
                { name: 'Adana Kebap', price: '₺139,90' },
                { name: 'Urfa Kebap', price: '₺139,90' },
                { name: 'Karışık Izgara', price: '₺179,90' }
            ]
        },
        {
            name: 'Kebapçı Mehmet',
            price: '₺159,90',
            url: 'https://www.kebapcimehmet.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺159,90' },
                { name: 'Adana Kebap', price: '₺129,90' },
                { name: 'Urfa Kebap', price: '₺129,90' },
                { name: 'Karışık Izgara', price: '₺169,90' }
            ]
        },
        {
            name: 'Kebapçı Hasan',
            price: '₺149,90',
            url: 'https://www.kebapcihasan.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺149,90' },
                { name: 'Adana Kebap', price: '₺119,90' },
                { name: 'Urfa Kebap', price: '₺119,90' },
                { name: 'Karışık Izgara', price: '₺159,90' }
            ]
        },
        {
            name: 'Kebapçı Ahmet',
            price: '₺139,90',
            url: 'https://www.kebapciahmet.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺139,90' },
                { name: 'Adana Kebap', price: '₺109,90' },
                { name: 'Urfa Kebap', price: '₺109,90' },
                { name: 'Karışık Izgara', price: '₺149,90' }
            ]
        },
        {
            name: 'Kebapçı Mustafa',
            price: '₺129,90',
            url: 'https://www.kebapcimustafa.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺129,90' },
                { name: 'Adana Kebap', price: '₺99,90' },
                { name: 'Urfa Kebap', price: '₺99,90' },
                { name: 'Karışık Izgara', price: '₺139,90' }
            ]
        },
        {
            name: 'Kebapçı Yusuf',
            price: '₺119,90',
            url: 'https://www.kebapciyusuf.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺119,90' },
                { name: 'Adana Kebap', price: '₺89,90' },
                { name: 'Urfa Kebap', price: '₺89,90' },
                { name: 'Karışık Izgara', price: '₺129,90' }
            ]
        },
        {
            name: 'Kebapçı Murat',
            price: '₺109,90',
            url: 'https://www.kebapcimurat.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺109,90' },
                { name: 'Adana Kebap', price: '₺79,90' },
                { name: 'Urfa Kebap', price: '₺79,90' },
                { name: 'Karışık Izgara', price: '₺119,90' }
            ]
        },
        {
            name: 'Kebapçı Kemal',
            price: '₺99,90',
            url: 'https://www.kebapcikemal.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'İskender', price: '₺99,90' },
                { name: 'Adana Kebap', price: '₺69,90' },
                { name: 'Urfa Kebap', price: '₺69,90' },
                { name: 'Karışık Izgara', price: '₺109,90' }
            ]
        }
    ],
    'burger': [
        {
            name: 'Burger King',
            price: '₺169,90',
            url: 'https://www.burgerking.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Whopper', price: '₺169,90' },
                { name: 'Double Whopper', price: '₺189,90' },
                { name: 'Chicken Royale', price: '₺159,90' },
                { name: 'Cheeseburger', price: '₺139,90' }
            ]
        },
        {
            name: "McDonald's",
            price: '₺159,90',
            url: 'https://www.mcdonalds.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Big Mac', price: '₺159,90' },
                { name: 'Double Big Mac', price: '₺179,90' },
                { name: 'McChicken', price: '₺149,90' },
                { name: 'Cheeseburger', price: '₺129,90' }
            ]
        },
        {
            name: 'Burger House',
            price: '₺149,90',
            url: 'https://www.burgerhouse.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺149,90' },
                { name: 'Double Burger', price: '₺169,90' },
                { name: 'Chicken Burger', price: '₺139,90' },
                { name: 'Cheese Burger', price: '₺119,90' }
            ]
        },
        {
            name: 'Burger Time',
            price: '₺139,90',
            url: 'https://www.burgertime.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺139,90' },
                { name: 'Double Burger', price: '₺159,90' },
                { name: 'Chicken Burger', price: '₺129,90' },
                { name: 'Cheese Burger', price: '₺109,90' }
            ]
        },
        {
            name: 'Burger World',
            price: '₺129,90',
            url: 'https://www.burgerworld.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺129,90' },
                { name: 'Double Burger', price: '₺149,90' },
                { name: 'Chicken Burger', price: '₺119,90' },
                { name: 'Cheese Burger', price: '₺99,90' }
            ]
        },
        {
            name: 'Burger Palace',
            price: '₺119,90',
            url: 'https://www.burgerpalace.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺119,90' },
                { name: 'Double Burger', price: '₺139,90' },
                { name: 'Chicken Burger', price: '₺109,90' },
                { name: 'Cheese Burger', price: '₺89,90' }
            ]
        },
        {
            name: 'Burger King',
            price: '₺109,90',
            url: 'https://www.burgerking.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺109,90' },
                { name: 'Double Burger', price: '₺129,90' },
                { name: 'Chicken Burger', price: '₺99,90' },
                { name: 'Cheese Burger', price: '₺79,90' }
            ]
        },
        {
            name: 'Burger Master',
            price: '₺99,90',
            url: 'https://www.burgermaster.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺99,90' },
                { name: 'Double Burger', price: '₺119,90' },
                { name: 'Chicken Burger', price: '₺89,90' },
                { name: 'Cheese Burger', price: '₺69,90' }
            ]
        },
        {
            name: 'Burger House',
            price: '₺89,90',
            url: 'https://www.burgerhouse.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺89,90' },
                { name: 'Double Burger', price: '₺109,90' },
                { name: 'Chicken Burger', price: '₺79,90' },
                { name: 'Cheese Burger', price: '₺59,90' }
            ]
        },
        {
            name: 'Burger Land',
            price: '₺79,90',
            url: 'https://www.burgerland.com.tr',
            lastUpdate: new Date(),
            menu: [
                { name: 'Classic Burger', price: '₺79,90' },
                { name: 'Double Burger', price: '₺99,90' },
                { name: 'Chicken Burger', price: '₺69,90' },
                { name: 'Cheese Burger', price: '₺49,90' }
            ]
        }
    ]
};

// Sample news data
const sampleNews = [
    {
        title: 'Yemeksepeti',
        text: 'Bugün tüm restoranlarda %20 indirim!',
        image: 'https://cdn.yemeksepeti.com/images/ys-new-logo.svg',
        url: 'https://www.yemeksepeti.com/',
        time: '1 dakika önce'
    },
    {
        title: 'Getir',
        text: 'İlk siparişe özel %30 indirim!',
        image: 'https://getir.com/_next/static/images/logo-883a75e1.svg',
        url: 'https://getir.com/',
        time: '2 dakika önce'
    },
    {
        title: 'Trendyol Yemek',
        text: 'Seçili restoranlarda %25 indirim!',
        image: 'https://cdn.dsmcdn.com/web/logo/ty-logo.svg',
        url: 'https://www.trendyol.com/yemek',
        time: '3 dakika önce'
    },
    {
        title: 'Migros Yemek',
        text: '100 TL üzeri siparişlere ücretsiz teslimat!',
        image: 'https://www.migros.com.tr/assets/images/logo.svg',
        url: 'https://www.migros.com.tr/yemek',
        time: '4 dakika önce'
    }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/api/restaurants/:category', (req, res) => {
    try {
        const category = req.params.category;
        const restaurants = sampleRestaurants[category];
        
        if (!restaurants) {
            return res.status(404).json({
                error: 'Kategori bulunamadı',
                message: `${category} kategorisi bulunamadı`
            });
        }

        // Her istekte fiyat güncelleme tarihlerini güncelle
        const updatedRestaurants = restaurants.map(restaurant => ({
            ...restaurant,
            lastUpdate: new Date()
        }));

        res.json(updatedRestaurants);
    } catch (error) {
        console.error('API Hatası:', error);
        res.status(500).json({
            error: 'Sunucu hatası',
            message: error.message
        });
    }
});

// News API endpoint
app.get('/api/news', (req, res) => {
    res.json(sampleNews);
});

// Kullanıcı kayıt endpoint'i
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        // Kullanıcı adı veya email kontrolü
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya email zaten kullanımda' });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Kayıt başarılı' });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu' });
    }
});

// Kullanıcı giriş endpoint'i
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Session'a kullanıcı bilgilerini kaydet
        req.session.user = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };

        res.json({ 
            message: 'Giriş başarılı',
            user: req.session.user
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
    }
});

// Çıkış endpoint'i
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Çıkış başarılı' });
});

// Giriş kontrolü endpoint'i
app.get('/api/check-login', (req, res) => {
    if (req.session.user) {
        res.json({ 
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Hata yönetimi middleware'i
app.use((err, req, res, next) => {
    console.error('Hata:', err);
    res.status(500).json({
        error: 'Sunucu hatası',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 4000;
// Bind to localhost to avoid permission issues on some environments
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server http://127.0.0.1:${PORT} adresinde çalışıyor`);
    console.log('Tüm dosyalar sunuluyor...');
});