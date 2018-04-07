const express = require('express');
const mongoose = require('mongoose'); // mongodb
const passport = require('passport'); // authentication js
const bcrypt = require('bcryptjs'); // encrypt and decrypt password

const router = express.Router();

//Load model into app
require('../models/User');
const User = mongoose.model('users');

//Load helpers
const {
    ensureAuthenticated
} = require('../helpers/auth');

//Login form and process
router.get("/login", (req, res) => {
    res.render('users/login', {
        hint_Email: "Enter your e-mail",
        hint_Password: "Enter your password",
        title: 'Login Page'
    });
});

//Register form and process
router.get('/register', (req, res) => {
    res.render('users/register', {
        hint_Fullname: "Enter your full name",
        hint_Email: "Enter your e-mail",
        hint_Password: "Enter your password",
        hint_Repassword: "Confirm your password",
        title: 'Register Page'
    });
});

// Logout process
router.get('/logout', (req, res) => {
    req.logout(); // delete session and logout
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

//View profile
router.get('/profile', ensureAuthenticated, (req, res) => {
    User.findById(req.user).then(user => res.render('users/profile', {
        user: user,
        title: 'Your Profile'
    }));
});

//Change Info
router.put('/profile/:id', ensureAuthenticated, (req, res) => {
    User.findOne({
            _id: req.params.id
        })
        .then(user => {
            // new values
            user.name = req.body.fname;

            user.save()
                .then(user => {
                    req.flash('success_msg', 'Edit your profile successfully');
                    res.redirect('/users/profile');
                });
        });
});

//Change Password
router.get('/changepsw', ensureAuthenticated, (req, res) => {
    res.render('users/changepsw', {
        title: 'Change your password page'
    });
});

router.put('/changepsw/:id', ensureAuthenticated, (req, res) => {
    User.findOne({
            _id: req.params.id
        })
        .then(user => {

            bcrypt.compare(req.body.oldPassword, user.password, function (err, result) {
                if (err) throw err;

                if (!result) {
                    req.flash('error_msg', 'Old password incorrect');
                    res.redirect('/users/changepsw');
                } else {
                    let errors = [];

                    if (req.body.newPassword != req.body.reNewPassword)
                        errors.push({
                            text: 'New password do not match, confirm password'
                        });
                    if (req.body.newPassword.length < 4)
                        errors.push({
                            text: 'New password must be at least 4 characters'
                        });

                    if (errors.length > 0) {
                        res.render('users/changepsw', {
                            errors: errors
                        });
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                                if (err) throw err;
                                user.password = hash;
                                user.save()
                                    .then(user => {
                                        req.flash('success_msg', 'You changed password successfully');
                                        res.redirect('/users/changepsw');
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return;
                                    });
                            });
                        });
                    }
                }
            });

        });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/register', (req, res) => {
    let errors = [];

    if (req.body.psw != req.body.repsw)
        errors.push({
            text: 'Password do not match, confirm password'
        });
    if (req.body.psw.length < 4)
        errors.push({
            text: 'Password must be at least 4 characters'
        });

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            fname: req.body.fname,
            email: req.body.email,
            psw: req.body.psw,
            repsw: req.body.repsw
        });
    } else {
        // check user register in database
        User.findOne({
            email: req.body.email
        }).then(user => {
            // if user exists
            if (user) {
                req.flash('error_msg', 'Email is registered, log in now');
                res.redirect('/users/register');
            }
            // else user not exists
            else {
                const newUser = new User({
                    name: req.body.fname,
                    email: req.body.email,
                    password: req.body.psw
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => {
                                console.log(err);
                                return;
                            });
                    });
                });
                console.log(newUser);
            }
        });
    }
});

module.exports = router;