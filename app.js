const express = require('express');
const cors = require('cors');
const getDb = require('./db/database');

const venueRoutes = require('./routes/venues');

const generateSlots =
  require('./utils/slotGenerator');

  const bookingRoutes =
  require('./routes/bookings');



const app = express();

app.use(cors());
app.use(express.json());

app.use('/venues', venueRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Quick Slot API Running'
  });
});

app.use('/bookings', bookingRoutes);

const PORT = 3000;

async function initializeDatabase() {

  const today =
  new Date().toISOString().split('T')[0];

await generateSlots(today);

  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS venues(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS slots(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER,
  slot_date TEXT,
  start_time TEXT,
  end_time TEXT,
  status TEXT DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  venue_id INTEGER,
  slot_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
  `);

  const venues = await db.all(
    'SELECT * FROM venues'
  );

  if (venues.length === 0) {

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Cricket Ground', 'Bengaluru']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Football Arena', 'Bengaluru']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Badminton Court', 'Bengaluru']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Tennis Club', 'Bengaluru']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Swimming Pool', 'Bengaluru']
    );

    console.log('Venue seed data inserted');
  }
}

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);