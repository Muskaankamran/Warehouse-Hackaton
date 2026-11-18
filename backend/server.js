import 'dotenv/config';
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const port = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
