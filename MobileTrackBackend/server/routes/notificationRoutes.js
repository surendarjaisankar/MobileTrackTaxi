const express = require('express');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const router = express.Router();

// Get notifications for a recipient
router.get('/:recipientId', async (req, res) => {
  try {
    const { recipientType = 'Driver', page = 1, limit = 20, isRead } = req.query;
    let query = {
      recipientId: mongoose.Types.ObjectId(req.params.recipientId),
      recipientType,
    };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.patch('/:recipientId/read-all', async (req, res) => {
  try {
    const { recipientType = 'Driver' } = req.query;

    await Notification.updateMany(
      {
        recipientId: mongoose.Types.ObjectId(req.params.recipientId),
        recipientType,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread count for recipient
router.get('/:recipientId/unread-count', async (req, res) => {
  try {
    const { recipientType = 'Driver' } = req.query;

    const unreadCount = await Notification.countDocuments({
      recipientId: mongoose.Types.ObjectId(req.params.recipientId),
      recipientType,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
