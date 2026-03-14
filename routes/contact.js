const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../database');
const nodemailer = require('nodemailer');

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const rateMap = new Map();
function rateOk(ip) {
  const now = Date.now(), win = 10*60*1000, max = 3;
  const e = rateMap.get(ip) || { c: 0, r: now + win };
  if (now > e.r) { rateMap.set(ip, { c: 1, r: now + win }); return true; }
  if (e.c >= max) return false;
  e.c++; rateMap.set(ip, e); return true;
}

router.post('/', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  if (!rateOk(ip)) return res.status(429).json({ success:false, message:'Too many submissions. Try again later.' });
  const { firstName, lastName, email, phone, company, service, message } = req.body;
  if (!firstName?.trim()) return res.status(400).json({ success:false, message:'First name is required.' });
  if (!email || !isValidEmail(email.trim())) return res.status(400).json({ success:false, message:'Valid email required.' });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.TEAM_MAIL,
    subject: "New Contact Form Message",
    text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${company}\nService: ${service}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log("Email error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank you for contacting Golden Circle Technologies",
    text: `Hello ${firstName} ${lastName},

  Thank you for contacting Golden Circle Technologies.

  Our team will get back to you shortly.

  Best regards,
  Golden Circle Technologies`
  });

  try {
    stmts.insert.run({
      uuid: uuidv4(),
      firstName: firstName.trim(), lastName: lastName?.trim()||'',
      email: email.trim().toLowerCase(), phone: phone?.trim()||'',
      company: company?.trim()||'', service: service||'',
      message: message?.trim()||'', ipAddress: ip,
      userAgent: req.headers['user-agent']||''
    });
    return res.status(201).json({ success:true, message:'Thank you! We will be in touch within 24 hours.' });
  } catch(err) {
    console.error('DB error:', err);
    return res.status(500).json({ success:false, message:'Server error. Please try again.' });
  }
  
});

module.exports = router;
