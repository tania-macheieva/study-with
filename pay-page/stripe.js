const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../db');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PLATFORM_ACCOUNT_ID = process.env.STRIPE_ACCOUNT_ID;

// router.get('/get-stripe-key', (req, res) => {
//     const publicKey = process.env.STRIPE_PUBLIC_KEY;
//     console.log('Returning public key:', publicKey ? 'Yes' : 'No');
    
//     if (!publicKey) {
//         return res.status(500).json({ error: 'Stripe public key not configured' });
//     }
    
//     res.json({ publicKey });
// });
router.get('/course/:id', async (req, res) => {
    const { id } = req.params;
    try { 
        const result = await pool.query(`
            SELECT ac.*, u.name as author_name 
            FROM all_courses ac
            LEFT JOIN users u ON ac.author_id = u.id
            WHERE ac.id = $1
        `, [id]); 
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
    const { courseId, userId } = req.body;
    console.log('Creating checkout session:', { courseId, userId });

    try {
        const authorCheck = await pool.query(
            'SELECT ac.*, t.author_stripe_account FROM all_courses ac ' +
            'LEFT JOIN teachers t ON ac.author_id = t.user_id ' +
            'WHERE ac.id = $1',
            [courseId]
        );

        if (authorCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = authorCheck.rows[0];
        const { author_stripe_account } = course;

        if (!author_stripe_account) {
            return res.status(403).json({
                error: 'Teacher has not connected their payment account'
            });
        }

        if (course.author_id === parseInt(userId)) {
            return res.status(403).json({ error: 'Author cannot purchase their own course' });
        }

        const enrollmentCheck = await pool.query(
            'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (enrollmentCheck.rows.length > 0) {
            return res.status(403).json({ error: 'Course already purchased' });
        }

        // Convert price to cents
        const coursePriceCents = Math.round(parseFloat(course.price) * 100);
        const platformFeeCents = Math.round(coursePriceCents * 0.3);
        const teacherAmountCents = coursePriceCents - platformFeeCents; 

        const transferGroup = `course_${courseId}_${Date.now()}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.name,
                        description: course.description || 'Course purchase',
                    },
                    unit_amount: coursePriceCents
                },
                quantity: 1
            }],
            payment_intent_data: {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                    destination: author_stripe_account,
                },
            },
            metadata: {
                courseId: courseId.toString(),
                userId: userId.toString(),
                platformFeeCents: platformFeeCents.toString(),
                teacherAmountCents: teacherAmountCents.toString(),
                teacherStripeAccount: author_stripe_account,
                transferGroup: transferGroup
            },
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/pay-page/success.html?courseId=${courseId}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/course-preview/?id=${courseId}`,

        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({ 
            error: error.message || 'An error occurred creating the checkout session' 
        });    }
});

router.get('/verify-payment', async (req, res) => {
    const { session_id } = req.query;
    
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const { courseId, userId } = req.query;
            
            // Get amounts from metadata (already in cents)
            const { platformFeeCents, teacherAmountCents } = session.metadata;
            const totalAmountCents = parseInt(platformFeeCents) + parseInt(teacherAmountCents);
            
            // Save to database (amounts in cents)
            await pool.query(
                `INSERT INTO payments (
                    user_id, 
                    course_id, 
                    amount, 
                    platform_fee, 
                    teacher_amount, 
                    stripe_session_id, 
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    userId, 
                    courseId, 
                    totalAmountCents,
                    platformFeeCents,
                    teacherAmountCents,
                    session_id, 
                    'completed'
                ]
            );
            
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

router.post('/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { 
                courseId, 
                userId,
                platformFeeCents,
                teacherAmountCents
            } = session.metadata;
            
            // Save to database (amounts in cents)
            await pool.query(
                `INSERT INTO payments (
                    user_id, 
                    course_id, 
                    amount, 
                    platform_fee, 
                    teacher_amount, 
                    stripe_session_id, 
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    userId,
                    courseId,
                    parseInt(platformFeeCents) + parseInt(teacherAmountCents),
                    platformFeeCents,
                    teacherAmountCents,
                    session.id,
                    'completed'
                ]
            );

            await pool.query(
                `INSERT INTO enrollments (
                    user_id, 
                    course_id, 
                    status, 
                    progress, 
                    enrollment_date
                ) VALUES ($1, $2, 'active', 0, CURRENT_TIMESTAMP)`,
                [userId, courseId]
            );
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});


router.get('/enrollments/check', async (req, res) => {
    const { userId, courseId } = req.query;
    
    try {
        const result = await pool.query(
            'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );
        
        res.json({ enrolled: result.rows.length > 0 });
    } catch (error) {
        console.error('Error checking enrollment:', error);
        res.status(500).json({ error: 'Failed to check enrollment status' });
    }
});
module.exports = router;