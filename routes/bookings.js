const express = require('express');
const router = express.Router();
const getDb = require('../db/database');

router.post('/', async (req, res) => {
  const { userName, venueId, slotId } = req.body;

  try {
    const db = await getDb();

    await db.exec('BEGIN TRANSACTION');

    const slot = await db.get(
      'SELECT * FROM slots WHERE id = ?',
      [slotId]
    );

    if (!slot) {
      await db.exec('ROLLBACK');

      return res.status(404).json({
        message: 'Slot not found'
      });
    }

    if (slot.status === 'BOOKED') {
      await db.exec('ROLLBACK');

      return res.status(400).json({
        message: 'Slot already booked'
      });
    }

    await db.run(
      'UPDATE slots SET status = ? WHERE id = ?',
      ['BOOKED', slotId]
    );

    await db.run(
      `INSERT INTO bookings
      (user_name, venue_id, slot_id)
      VALUES (?, ?, ?)`,
      [userName, venueId, slotId]
    );

    await db.exec('COMMIT');

    res.json({
      success: true,
      message: 'Booking successful'
    });

  } catch (e) {
    const db = await getDb();
    await db.exec('ROLLBACK');

    res.status(500).json({
      error: e.message
    });
  }
});

module.exports = router;