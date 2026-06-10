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

router.get('/', async (req, res) => {

  const { userName } = req.query;

  const db = await getDb();

  try {

    const bookings = await db.all(
      `
      SELECT
        b.id,
        v.name as venueName,
        s.slot_date,
        s.start_time,
        s.end_time
      FROM bookings b
      INNER JOIN venues v
        ON v.id = b.venue_id
      INNER JOIN slots s
        ON s.id = b.slot_id
      WHERE b.user_name = ?
      ORDER BY b.id DESC
      `,
      [userName]
    );

    res.json(bookings);

  } catch (e) {

    res.status(500).json({
      error: e.message,
    });

  }
});

router.delete('/:id', async (req, res) => {

  const bookingId = req.params.id;

  const db = await getDb();

  try {

    await db.exec(
      'BEGIN TRANSACTION'
    );

    const booking =
      await db.get(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
        `,
        [bookingId]
      );

    if (!booking) {

      await db.exec(
        'ROLLBACK'
      );

      return res.status(404).json({
        message:
            'Booking not found',
      });
    }

    await db.run(
      `
      UPDATE slots
      SET status='AVAILABLE'
      WHERE id=?
      `,
      [booking.slot_id]
    );

    await db.run(
      `
      DELETE FROM bookings
      WHERE id=?
      `,
      [bookingId]
    );

    await db.exec(
      'COMMIT'
    );

    res.json({
      success: true,
      message:
          'Booking cancelled',
    });

  } catch (e) {

    await db.exec(
      'ROLLBACK'
    );

    res.status(500).json({
      error: e.message,
    });
  }
});

module.exports = router;