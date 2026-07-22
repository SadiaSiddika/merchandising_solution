const db = require('./db');

async function test() {
  await db.initDb();
  console.log("Deleting user 5...");
  try {
    const res = await db.runExec("DELETE FROM users WHERE id = ?", [5]);
    console.log("Delete success!", res);
    const users = await db.runQuery("SELECT * FROM users");
    console.log("Remaining users:", users);
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

test().catch(console.error);
