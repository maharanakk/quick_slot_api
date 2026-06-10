const express = require('express');
const router = express.Router();

const getDb = require('../db/database');

router.get('/', async (req, res) => {

  try {

    const db = await getDb();

    const venues = await db.all(
      'SELECT * FROM venues'
    );

    res.json(venues);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

module.exports = router;