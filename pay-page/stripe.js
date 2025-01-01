const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../db'); 
require('dotenv').config({ path: '../secret.env' });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

router.post('/create-checkout-session', async (req, res) => {
    const { courseId } = req.body;

    try {
        const result = await pool.query('SELECT * FROM all_courses WHERE id = $1', [courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = result.rows[0];
        const priceInCents = Math.round(parseFloat(course.price) * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.name,
                            description: course.description,
                            images: [course.image_url],
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:8000/pay-page/success.html`,
            cancel_url: `http://localhost:8000/pay-page/cancel.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Error creating a Stripe session' });
    }
});

module.exports = router;
