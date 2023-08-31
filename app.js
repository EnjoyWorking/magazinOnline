const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://root:AmirTest.2000@cluster0.n4b3k1v.mongodb.net/shop?retryWrites=true&w=majority'

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})
const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}))
app.use(csrfProtection)
app.use(flash())
app.use((req, res, next) => {
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})

app.use((req, res, next) =>{
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next() 
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('connected')
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
  
  