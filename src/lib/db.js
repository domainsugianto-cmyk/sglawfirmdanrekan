import mysql from 'mysql2/promise';

let pool;

export async function getDbConnection() {
  if (!pool) {
    // First, connect without a database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS db_pengacara`);
    await connection.end();

    // Now create the pool with the database selected
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'db_pengacara',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Initialize tables
    await initializeDatabase();
  }
  return pool;
}

async function initializeDatabase() {
  const db = pool;

  // Table for site content (JSON text per section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      section VARCHAR(50) PRIMARY KEY,
      data JSON NOT NULL
    )
  `);

  // Table for team
  await db.query(`
    CREATE TABLE IF NOT EXISTS team (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      role VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table for testimonials
  await db.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      avatar VARCHAR(255),
      is_approved BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table for gallery
  await db.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url VARCHAR(255) NOT NULL,
      position INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default content if empty
  const [contentRows] = await db.query(`SELECT count(*) as count FROM site_content`);
  if (contentRows[0].count === 0) {
    const defaultContent = {
      hero: {
        badge: "Kantor Hukum Terpercaya",
        title: "Kantor Hukum",
        titleAccent: "SG Law Firm",
        titleEnd: "dan Rekan",
        description: "Kepuasaan Anda, Prioritas Kami.. Berkomitmen untuk memberikan pengalaman terbaik bagi Anda.",
        stats: [
          { value: "500+", label: "Kasus Ditangani" },
          { value: "0", label: "Tim Profesional", source: "teamCount" },
          { value: "98%", label: "Klien Puas" }
        ]
      },
      about: {
        title: "Kantor Hukum SG Law Firm dan Rekan",
        description: "Kami mengutamakan layanan, kualitas dan hasil yang terbaik."
      },
      contact: {
        address: "Modern, Ruko Mall Metropolis Town Square, Jl. Hartono Raya No.17 Unit GM 5#15-16, Klp. Indah, Kec. Tangerang",
        hours: "08.00 - 17.00 WIB",
        phone: "087772057005",
        whatsapp: "6287772057005",
        mapQuery: "Infinity+Workspace,+Tangerang"
      },
      cta: {
        title: "Konsultasi Sekarang!",
        description: "Jangan ragu untuk menghubungi kami sekarang dan temukan solusi terbaik!"
      },
      footer: {
        description: "Memberikan solusi hukum terbaik dengan integritas dan profesionalisme.",
        youtube: "https://www.youtube.com/@sglawfirmtvchannelnews",
        whatsapp: "https://api.whatsapp.com/send/?phone=6287772057005",
        tiktok: "https://www.tiktok.com/@kantor.hukum.sgla"
      },
      advantages: [
        { title: "Dijamin Aman", description: "Aman dan terpercaya", icon: "shield" },
        { title: "Harga Terjangkau", description: "Harga bersaing", icon: "dollar" },
        { title: "Berpengalaman", description: "Tim ahli", icon: "award" },
        { title: "Berkualitas", description: "Kualitas terbaik", icon: "check" }
      ]
    };

    for (const [key, value] of Object.entries(defaultContent)) {
      await db.query(`INSERT INTO site_content (section, data) VALUES (?, ?)`, [key, JSON.stringify(value)]);
    }
  }

  const [heroRows] = await db.query('SELECT data FROM site_content WHERE section = ?', ['hero']);
  if (heroRows.length > 0) {
    const hero = typeof heroRows[0].data === 'string' ? JSON.parse(heroRows[0].data) : heroRows[0].data;
    const teamStat = hero.stats?.find(stat => stat.label === 'Tim Profesional' && !stat.source);
    if (teamStat) {
      teamStat.source = 'teamCount';
      await db.query('UPDATE site_content SET data = ? WHERE section = ?', [JSON.stringify(hero), 'hero']);
    }
  }
}
