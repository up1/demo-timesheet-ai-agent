'use strict';

const path = require('path');
const express = require('express');

const reportRoutes = require('./routes/reportRoutes');
const addRoutes = require('./routes/addRoutes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded form submissions
app.use(express.urlencoded({ extended: false }));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Root redirects to the report page
app.get('/', (req, res) => res.redirect('/report'));

// Feature routes
app.use('/', reportRoutes);
app.use('/', addRoutes);

// Test-support routes (never in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/', require('./routes/testRoutes'));
}

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
