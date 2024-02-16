const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

var auth = require('../services/authentication')

//api for user to login
router.post('/login', (req, res) => {
    const user = req.body;
    query = 'select u_type,username,pswd from master_user_table where username=?';
    connection.query(query, [user.username], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].pswd != user.pswd) {
                return res.status(401).json({ message: "Incorrect username or password" });
            }
            else if (results[0].pswd == user.pswd) {
                const response = { username: results[0].username, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ token: accessToken });

            }
            else {
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
            }

        }
        else {
            return res.status(500).json(err);
        }
    })
})

//
const transporter = nodemailer.createTransport({
    host: 'smtp.forwardemail.net',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select username,pswd from master_user_table where username=? ";
    connection.query(query, [user.username], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(404).json({ message: "Email not registered" });
            }
            else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].username,
                    subject: 'Password by Shree Shanta Hostel Accomodations',
                    html: '<p><b>Your login details for Shree Shanta Hostel Accomodations</b><br><b>Email:</b>' + results[0].username + '<br><b>Password: </b>' + results[0].pswd + '<br><a href="http://localhost:4200/">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                return res.status(200).json({ message: "Password sent successfully to your email." });

            }

        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
})


router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.username;
    console.log(email);
    var query = "select * from master_user_table where username=? and pswd=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old password" });
            }
            else if (results[0].pswd == user.oldPassword) {
                query = "update master_user_table set pswd=? where username=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password updated successfully." });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
})


router.post('/resetPassword', (req, res) => {
    const user = req.body;
    const email = user.username;

    // Update password
    const query = "UPDATE master_user_table SET pswd = ? WHERE username = ?";
    connection.query(query, [user.newPassword, email], (err, results) => {
        if (err) {
            console.error('Error updating password: ' + err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "Password updated successfully" });
    });
});

module.exports = router;
