const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load model into app
const User = mongoose.model('users');

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'psw'
    }, (email, psw, done) => {
        User.findOne({
            email: email
        }).then(user => {
            if (!user) {
                done(null, false, {
                    message: 'No User Found'
                }); // nếu không tìm thấy user
            } else {
                // compare psw với password user theo mã hóa bcrypt
                bcrypt.compare(psw, user.password, (err, result) => {
                    if (err) throw err;

                    // check password từ login form với password user
                    if (result) {
                        done(null, user); // đúng trả về user
                    } else {
                        done(null, false, {
                            message: 'Password incorrect'
                        }); // sai in ra thông báo
                    }
                });
            }
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};