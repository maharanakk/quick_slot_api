const express = require('express');
const cors = require('cors');
const getDb = require('./db/database');

const venueRoutes = require('./routes/venue');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/venues', venueRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Quick Slot API Running'
  });
});

const PORT = 3000;

async function initializeDatabase() {

  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS venues(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );
  `);

  const venues = await db.all(
    'SELECT * FROM venues'
  );

  if (venues.length === 0) {

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Cricket Ground', 'Chennai']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Football Arena', 'Chennai']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Badminton Court', 'Chennai']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Tennis Club', 'Chennai']
    );

    await db.run(
      'INSERT INTO venues(name,location) VALUES (?,?)',
      ['Swimming Pool', 'Chennai']
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