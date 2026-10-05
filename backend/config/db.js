const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Purana InfraLens DB URL default fallback me diya hai
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/infralens';

    const conn = await mongoose.connect(MONGO_URI);

    console.log(`✅ MongoDB Connected Successfully for InfraLens Portal: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    process.exit(1); // Error aane par process terminate kar dega
  }
};

module.exports = connectDB;