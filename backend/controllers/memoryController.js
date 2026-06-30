const fs = require('fs');
const path = require('path');
const Memory = require('../models/Memory');
const { getIsMockMode } = require('../config/db');
const { getMockData, saveMockData } = require('../config/mockStore');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');

// Get all memories
exports.getMemories = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const mockData = getMockData();
      return res.status(200).json({ success: true, count: mockData.memories.length, data: mockData.memories });
    } else {
      const memories = await Memory.find().sort({ date: 1 }); // Sort chronologically
      return res.status(200).json({ success: true, count: memories.length, data: memories });
    }
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a memory
exports.createMemory = async (req, res) => {
  const { description, date, tags, isFavorite } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  if (!description || !date) {
    return res.status(400).json({ success: false, message: 'Please provide description and date' });
  }

  try {
    let imageUrl = '';
    let publicId = null;

    if (isCloudinaryConfigured) {
      imageUrl = req.file.path; // Cloudinary URL
      publicId = req.file.filename; // Cloudinary public_id
    } else {
      // Local fallback url path (relative or full)
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      publicId = req.file.filename; // Keep filename to delete it later if needed
    }

    // Parse tags (tags can be sent as JSON string array or comma separated string)
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      }
    }

    const memoryData = {
      imageUrl,
      publicId,
      description,
      date,
      tags: parsedTags,
      isFavorite: isFavorite === 'true' || isFavorite === true
    };

    if (getIsMockMode()) {
      const mockData = getMockData();
      const newMemory = {
        _id: 'mock-mem-' + Date.now(),
        ...memoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.memories.push(newMemory);
      saveMockData(mockData);

      return res.status(201).json({ success: true, data: newMemory });
    } else {
      const memory = await Memory.create(memoryData);
      return res.status(201).json({ success: true, data: memory });
    }
  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update memory
exports.updateMemory = async (req, res) => {
  const { id } = req.params;
  const { description, date, tags, isFavorite } = req.body;

  try {
    // Parse tags if sent
    let parsedTags;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      }
    }

    if (getIsMockMode()) {
      const mockData = getMockData();
      const memoryIndex = mockData.memories.findIndex(m => m._id === id);

      if (memoryIndex === -1) {
        return res.status(404).json({ success: false, message: 'Memory not found' });
      }

      const existingMemory = mockData.memories[memoryIndex];

      const updatedMemory = {
        ...existingMemory,
        description: description !== undefined ? description : existingMemory.description,
        date: date !== undefined ? date : existingMemory.date,
        tags: parsedTags !== undefined ? parsedTags : existingMemory.tags,
        isFavorite: isFavorite !== undefined ? (isFavorite === 'true' || isFavorite === true) : existingMemory.isFavorite,
        updatedAt: new Date().toISOString()
      };

      mockData.memories[memoryIndex] = updatedMemory;
      saveMockData(mockData);

      return res.status(200).json({ success: true, data: updatedMemory });
    } else {
      const memory = await Memory.findById(id);

      if (!memory) {
        return res.status(404).json({ success: false, message: 'Memory not found' });
      }

      if (description !== undefined) memory.description = description;
      if (date !== undefined) memory.date = date;
      if (parsedTags !== undefined) memory.tags = parsedTags;
      if (isFavorite !== undefined) memory.isFavorite = (isFavorite === 'true' || isFavorite === true);

      await memory.save();
      return res.status(200).json({ success: true, data: memory });
    }
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete memory
exports.deleteMemory = async (req, res) => {
  const { id } = req.params;

  try {
    let publicId = null;
    let found = false;

    if (getIsMockMode()) {
      const mockData = getMockData();
      const memoryIndex = mockData.memories.findIndex(m => m._id === id);

      if (memoryIndex !== -1) {
        publicId = mockData.memories[memoryIndex].publicId;
        mockData.memories.splice(memoryIndex, 1);
        saveMockData(mockData);
        found = true;
      }
    } else {
      const memory = await Memory.findById(id);
      if (memory) {
        publicId = memory.publicId;
        await Memory.findByIdAndDelete(id);
        found = true;
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    // Clean up file storage
    if (publicId) {
      if (isCloudinaryConfigured) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Cloudinary destroy error:', err);
        }
      } else {
        // Delete local upload file
        const filePath = path.join(__dirname, '..', 'uploads', publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
