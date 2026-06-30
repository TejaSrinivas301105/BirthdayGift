const express = require('express');
const router = express.Router();
const { getMemories, createMemory, updateMemory, deleteMemory } = require('../controllers/memoryController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMemories);
router.post('/', protect, upload.single('image'), createMemory);
router.put('/:id', protect, updateMemory);
router.delete('/:id', protect, deleteMemory);

module.exports = router;
