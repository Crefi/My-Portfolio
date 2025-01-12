const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment'); 

// Route to fetch comments for a specific project using query parameter
router.get('/comments', async (req, res) => {
  const { projectId } = req.query; 
  try {
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Find comments for the specific project
    const comments = await Comment.find({ projectId }); 
    res.json(comments); 
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Route to post a new comment for a specific project
router.post('/comments', async (req, res) => {
  const { projectId } = req.body; 
  const { user, text } = req.body; 

  if (!projectId || !user || !text) {
    return res.status(400).json({ error: 'Project ID, user, and text are required' });
  }

  try {
    // Create a new comment document for the specific project
    const newComment = new Comment({
      user,
      text,
      projectId, 
      createdAt: new Date(),
    });

    // Save the comment to the database
    await newComment.save();

    res.status(201).json(newComment); 
  } catch (error) {
    res.status(500).json({ error: 'Error posting comment' });
  }
});

// Route to post a reply to a specific comment on a specific project
router.post('/comments/:projectId/:id/reply', async (req, res) => {
  const { id, projectId } = req.params; 
  const { user, text } = req.body; 

  if (!user || !text) {
    return res.status(400).json({ error: 'User and text are required for the reply' });
  }

  try {
    const comment = await Comment.findOne({ _id: id, projectId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Add the reply to the comment's replies array
    comment.replies.push({ user, text });
    await comment.save();

    res.status(201).json(comment); 
  } catch (error) {
    res.status(500).json({ message: 'Error posting reply' });
  }
});


module.exports = router;
