/**
 * routes/contact.js
 * POST /api/contact — saves to Supabase + sends emails via nodemailer
 */

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../database');
const { sendUserEmail, sendAdminEmail } = require('../mailer');

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const rateMap = new Map();
function rateOk(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, max = 5;
  const entry = rateMap.get(ip) || { c: 0, r: now + win };
  if (now > entry.r) { rateMap.set(ip, { c: 1, r: now + win }); return true; }
  if (entry.c >= max) return false;
  entry.c++;
  rateMap.set(ip, entry);
  return true;
}

router.post('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
              || req.socket.remoteAddress || 'unknown';

    if (!rateOk(ip)) {
      return res.status(429).json({ success: false, message: 'Too many submissions. Please try again later.' });
    }

    const { firstName, lastName, email, phone, company, service, message } = req.body;

    if (!firstName?.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const data = {
      uuid:      uuidv4(),
      firstName: firstName.trim(),
      lastName:  lastName?.trim()  || '',
      email:     email.trim().toLowerCase(),
      phone:     phone?.trim()     || '',
      company:   company?.trim()   || '',
      service:   service           || '',
      message:   message?.trim()   || '',
      ipAddress: ip,
      userAgent: req.headers['user-agent'] || ''
    };

    // 1. Save to database
    await stmts.insert(data);

    // 2. Send emails (non-blocking — don't fail form if email fails)
    Promise.all([
      sendUserEmail(data.email, data.firstName, data.service),
      sendAdminEmail(data)
    ]).then(() => {
      console.log(`✅ Emails sent for submission from ${data.email}`);
    }).catch(err => {
      console.error('⚠️ Email send error (data was saved):', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! We will be in touch within 24 hours. A confirmation email has been sent to you.'
    });

  } catch (err) {
    console.error('❌ /api/contact error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please email us at goldencircletechnologies123@gmail.com'
    });
  }
});

module.exports = router;