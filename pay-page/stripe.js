const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../db'); 
require('dotenv').config();  // Load the default .env file
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Отримуємо дані курсу за ID
router.get('/course/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM all_courses WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Error when receiving course data' });
    }
});

// Створюємо сесію Stripe для обробки платежу
router.post('/create-checkout-session', async (req, res) => {
    const { courseId, userId, donationAmount = 0 } = req.body;
    console.log('Creating checkout session:', { courseId, userId, donationAmount });

    try {
        const result = await pool.query('SELECT * FROM all_courses WHERE id = $1', [courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = result.rows[0];
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.name,
                        description: course.description || 'Course purchase'
                    },
                    unit_amount: Math.round(parseFloat(course.price) * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/pay-page/success.html?courseId=${courseId}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/pay-page/cancel.html`
        });

        console.log('Session created:', session.url);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Додайте новий маршрут для перевірки статусу оплати
router.get('/verify-payment', async (req, res) => {
    const { session_id } = req.query;
    
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const { courseId, userId } = req.query;
            
            // Записуємо користувача на курс
            await pool.query(
                `INSERT INTO enrollments (user_id, course_id, status, progress, enrollment_date)
                 VALUES ($1, $2, 'active', 0, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id, course_id) DO NOTHING`,
                [userId, courseId]
            );
            
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Обробка webhook від Stripe
router.post('/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log('Webhook event received:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Отримуємо дані з метаданих сесії
            const courseId = session.metadata.courseId;
            const userId = session.metadata.userId;
            
            console.log('Processing enrollment:', { courseId, userId });

            // Записуємо користувача на курс
            await pool.query(
                `INSERT INTO enrollments (user_id, course_id, status, progress, enrollment_date)
                 VALUES ($1, $2, 'active', 0, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id, course_id) DO NOTHING`,
                [userId, courseId]
            );

            console.log('Enrollment completed successfully');
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;
