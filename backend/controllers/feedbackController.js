const Feedback = require('../models/Feedback');
const { getIsMockMode } = require('../config/db');
const { getMockData, saveMockData } = require('../config/mockStore');

exports.submitFeedback = async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 3) {
    return res.status(400).json({ success: false, message: 'Please provide a valid rating (1-3)' });
  }

  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    if (getIsMockMode()) {
      const mockData = getMockData();
      const feedback = {
        _id: 'mock-fb-' + Date.now(),
        rating,
        ipAddress,
        createdAt: new Date().toISOString()
      };
      mockData.feedbacks.push(feedback);
      saveMockData(mockData);

      return res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
    } else {
      const feedback = await Feedback.create({ rating, ipAddress });
      return res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
    }
  } catch (error) {
    console.error('Feedback submit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    if (getIsMockMode()) {
      const mockData = getMockData();
      const total = mockData.feedbacks.length;
      const ratingsCount = { 1: 0, 2: 0, 3: 0 };
      mockData.feedbacks.forEach(f => {
        ratingsCount[f.rating] = (ratingsCount[f.rating] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          total,
          ratingsCount
        }
      });
    } else {
      const feedbacks = await Feedback.find();
      const total = feedbacks.length;
      const ratingsCount = { 1: 0, 2: 0, 3: 0 };
      feedbacks.forEach(f => {
        ratingsCount[f.rating] = (ratingsCount[f.rating] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          total,
          ratingsCount
        }
      });
    }
  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
