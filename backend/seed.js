require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  await User.deleteMany({});
  await User.create({ email: 'asrithasai27@gmail.com', password: 'asritha123' });

  // console.log('✅ User seeded: vts.srinivas2005@gmail.com / asritha123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
