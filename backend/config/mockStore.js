const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, '..', 'data', 'mockDb.json');

const initMockDb = () => {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    const defaultPasswordHash = bcrypt.hashSync('asritha123', 10);
    fs.writeFileSync(dbFile, JSON.stringify({
      users: [
        {
          _id: 'mock-user-1',
          email: 'vts.srinivas2005@gmail.com',
          password: defaultPasswordHash,
          otp: null,
          otpExpires: null,
          otpVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      memories: [
        {
          _id: 'mock-mem-1',
          imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
          description: 'The beginning of our magical friendship journey!',
          date: '2025-09-10',
          tags: ['Friendship', 'Journey', 'Beginning'],
          isFavorite: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock-mem-2',
          imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
          description: 'Laughter, stars, and beautiful moments we will keep forever.',
          date: '2026-02-14',
          tags: ['Laughter', 'Moments', 'Magical'],
          isFavorite: false,
          createdAt: new Date().toISOString()
        }
      ],
      feedbacks: []
    }, null, 2));
  }
};

const getMockData = () => {
  initMockDb();
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
};

const saveMockData = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

module.exports = { getMockData, saveMockData, initMockDb };
