'use strict';

const path = require('path');
const express = require('express');

const reportRoutes = require('./routes/reportRoutes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Root redirects to the report page
app.get('/', (req, res) => res.redirect('/report'));

// Feature routes
app.use('/', reportRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
