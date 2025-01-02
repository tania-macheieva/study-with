const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../db');
require('dotenv').config();

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
    const { courseId, donationAmount = 0 } = req.body;

    try {
        // Отримуємо курс із бази даних
        const result = await pool.query('SELECT * FROM all_courses WHERE id = $1', [courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = result.rows[0];

        // Перевіряємо, чи прив'язаний Stripe акаунт автора
        if (!course.author_stripe_account) {
            return res.status(400).json({ error: 'Author Stripe account is not linked to this course.' });
        }

        // Перетворення ціни курсу та донату в центи
        const coursePriceInCents = Math.round(parseFloat(course.price) * 100);
        const donationInCents = Math.max(0, Math.round(parseFloat(donationAmount) * 100) || 0);

        const lineItems = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.name,
                        description: course.description,
                        images: [course.image_url],
                    },
                    unit_amount: coursePriceInCents,
                },
                quantity: 1,
            }
        ];

        // Додаємо донат до платежу, якщо він є
        if (donationInCents > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Platform Support Donation',
                        description: 'Thank you for supporting our platform!',
                    },
                    unit_amount: donationInCents,
                },
                quantity: 1,
            });
        }

        // Розрахунок комісії платформи (30% від ціни курсу)
        const platformFee = Math.round(coursePriceInCents * 0.3);
        const authorAmount = coursePriceInCents - platformFee;

        // Створюємо сесію Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            payment_intent_data: {
                application_fee_amount: platformFee, // Комісія платформи
                transfer_data: {
                    destination: course.author_stripe_account, // 70% йде автору
                },
            },
            mode: 'payment',
            success_url: 'http://localhost:8000/pay-page/success.html',
            cancel_url: 'http://localhost:8000/pay-page/cancel.html',
            metadata: {
                courseId,
                donationAmount: donationInCents,
            }
        });

        // Повертаємо URL сесії Stripe
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Error creating a Stripe session' });
    }
});

module.exports = router;
