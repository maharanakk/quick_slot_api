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

const generateSlotsForDate = async (
  db,
  venueId,
  date,
) => {

  const existingSlots =
      await db.all(
    `
    SELECT *
    FROM slots
    WHERE venue_id=?
    AND slot_date=?
    `,
    [venueId, date]
  );

  if (existingSlots.length > 0) {
    return;
  }

  for (
    let hour = 6;
    hour < 22;
    hour++
  ) {

    await db.run(
      `
      INSERT INTO slots
      (
        venue_id,
        slot_date,
        start_time,
        end_time,
        status
      )
      VALUES (?,?,?,?,?)
      `,
      [
        venueId,
        date,
        `${hour}:00`,
        `${hour + 1}:00`,
        'AVAILABLE'
      ]
    );
  }
};

/**
 * GET /venues/:id/slots?date=YYYY-MM-DD
 * Get slots for a venue on a specific date
 */
router.get('/:id/slots', async (req, res) => {

  try {

    const db = await getDb();

    const venueId =
      parseInt(req.params.id);

    const date =
      req.query.date;

    if (!date) {
      return res.status(400).json({
        success: false,
        message:
            'Date is required',
      });
    }

    // Auto-create slots if missing
    await generateSlotsForDate(
      db,
      venueId,
      date,
    );

    const slots =
      await db.all(
        `
        SELECT *
        FROM slots
        WHERE venue_id=?
        AND slot_date=?
        ORDER BY start_time
        `,
        [venueId, date]
      );

    res.json({
      success: true,
      date,
      totalSlots:
          slots.length,
      slots,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error:
          error.message,
    });
  }
});

module.exports = router;