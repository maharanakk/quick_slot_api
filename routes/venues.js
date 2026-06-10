const express = require('express');
const router = express.Router();

const getDb = require('../db/database');

/**
 * GET /venues
 * Get all venues
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb();

    const venues = await db.all(`
      SELECT *
      FROM venues
      ORDER BY id
    `);

    res.status(200).json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error.message,
    });
  }
});

/**
 * GET /venues/:id/slots?date=YYYY-MM-DD
 * Get slots for a venue on a specific date
 */
router.get('/:id/slots', async (req, res) => {
  try {
    const db = await getDb();

    const venueId = parseInt(req.params.id);
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date query parameter is required',
      });
    }

    // Check venue exists
    const venue = await db.get(
      'SELECT * FROM venues WHERE id = ?',
      [venueId]
    );

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    const slots = await db.all(
      `
      SELECT
        id,
        venue_id,
        slot_date,
        start_time,
        end_time,
        status
      FROM slots
      WHERE venue_id = ?
      AND slot_date = ?
      ORDER BY start_time
      `,
      [venueId, date]
    );

    res.status(200).json({
      success: true,
      venue: venue.name,
      date,
      totalSlots: slots.length,
      slots,
    });
  } catch (error) {
    console.error('Error fetching slots:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch slots',
      error: error.message,
    });
  }
});

module.exports = router;