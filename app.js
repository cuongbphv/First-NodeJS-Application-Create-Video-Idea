// import library
const express = require('express'); // import framework express
const exphbs = require('express-handlebars'); // giao diện handlebars
const methodOverride = require('method-override'); //sử dụng ajax để làm việc với các method
const mongoose = require('mongoose'); // kết nối làm việc với mongdb
const path = require('path'); // lấy dòng dẫn thư mục
const bodyParser = require("body-parser"); // làm việc với chuyển đổi kiểu dữ liệu json
const flash = require('connect-flash'); // send messeage từ backend tới frontend
const session = require('express-session'); // làm việc với session express kiểm tra phiên kết nối
const passport = require('passport'); // passport authentication

//Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

const app = express();

//Config folder contains css and js
app.use(express.static(path.join(__dirname, '/assets')));

//Config passport
require('./config/passport')(passport);
//Config database
const db = require('./config/database');

// create port and listen
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});

//Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect and work with MongoDB
mongoose.connect(db.mongoURI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch(err => console.log("Error connect to MongoDB: " + err));


//Express Handlebars Middleware
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Body-Parser Middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Method-Override Middleware
app.use(methodOverride('_method'));

//Express-session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware : use session js to keep on login user
app.use(passport.initialize());
app.use(passport.session());

//Connect-flash Middleware
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


// Main URL
app.get("/about", (req, res) => {
    res.render('about',{
        title: 'About Website'
    });
});

app.get("/", (req, res) => {
    res.render('index',{
        title: 'Create Video Idea NodeJS'
    });
});


// Use routes to direct
app.use('/ideas', ideas);
app.use('/users',users);