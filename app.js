const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

const defaultSrcs = ['https://js.stripe.com', 'https://ssl.gstatic.com'];

const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.1/axios.min.js',
  'https://parceljs.org/',
  'https://js.stripe.com/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com',
  'ws:',
  'https://js.stripe.com/v3/',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.1/axios.min.js',
  'https://parceljs.org/',
  'https://js.stripe.com/v3/',
  'ws:',
  'https://fonts.gstatic.com',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.1/axios.min.js',
  'https://parceljs.org/',
  'https://js.stripe.com/v3/',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'ws:',
];
const fontSrcUrls = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'https://js.stripe.com/v3/',
];

// Use contentSecurityPolicy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...defaultSrcs],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", 'blob:', 'data:', 'gap:', ...scriptSrcUrls],
      styleSrc: [
        "'self'",
        'blob:',
        'data:',
        'gap:',
        "'unsafe-inline'",
        "'unsafe-eval'",
        ...styleSrcUrls,
      ],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'gap:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Disable contentSecurityPolicy
// app.use(
//   helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
// );

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, '/public')));

// Set Security HTTP headers
// app.use(helmet())
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NOSQL query injection
app.use(mongoSantize());

// Data sanitization against XSS
app.use(xss());

// Prevent paramater pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middlewave
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
