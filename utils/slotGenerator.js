const getDb = require('../db/database');

async function generateSlots(date) {

  const db = await getDb();

  const venues = await db.all(
    'SELECT * FROM venues'
  );

  for (const venue of venues) {

    const existingSlots = await db.all(
      `
      SELECT *
      FROM slots
      WHERE venue_id = ?
      AND slot_date = ?
      `,
      [venue.id, date]
    );

    if (existingSlots.length > 0) {
      continue;
    }

    for (let hour = 6; hour < 22; hour++) {

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
        VALUES(?,?,?,?,?)
        `,
        [
          venue.id,
          date,
          `${hour}:00`,
          `${hour + 1}:00`,
          'AVAILABLE'
        ]
      );
    }
  }

  console.log(`Slots generated for ${date}`);
}

module.exports = generateSlots;