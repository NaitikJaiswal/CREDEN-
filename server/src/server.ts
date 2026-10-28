import { app } from './app.js';
import { config } from './config/index.js';
import { dbStore } from './db/store.js';
import { seedDatabase } from './seed/seed.js';

async function startServer() {
  console.log('🚀 Initializing CREDEN Backend Server...');
  await dbStore.init();

  // If database is not seeded, seed synthetic demonstration data
  if (!dbStore.isSeeded && dbStore.institutions.length === 0) {
    await seedDatabase();
  }

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`✨ CREDEN Platform API Server is active`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.env}`);
    console.log(`🛡️ APAAR Authoritative Adapter: Simulated Demo Fixtures`);
    console.log(`🔐 Role Accounts Seeded: 4 (AICTE Admin, Inst Admin, Student, Verifier)`);
    console.log(`=======================================================`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});

