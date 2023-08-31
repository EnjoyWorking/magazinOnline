const User = require('../models/user');
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash('error')
  if(errorMessage.length > 0){
    errorMessage = errorMessage[0]
  }else{
    errorMessage = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: errorMessage
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({email: email})
    .then(user => {
      if(!user){
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password)
        .then(result =>{
          if(result){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) =>{
              console.log(err)
              return res.redirect('/')
            })
          }
          req.flash('error', 'Invalid email or password')
          return res.redirect('/login')
        })
        .catch(err =>{
          console.log('bcrypt compare error')
          res.redirect('/login')
        })
     
    })
    .catch(err => console.log('post login error', err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let errorMessage = req.flash('error')
  if(errorMessage.length > 0){
    errorMessage = errorMessage[0]
  }else{
    errorMessage = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: errorMessage
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if(password !== confirmPassword){
    req.flash('error', 'Passwords dont match')
    return res.redirect('/signup')
  }
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email already exists')
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
        .then(hashedPassword =>{
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
        })
        return user.save();
      })
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
