const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
  const newTask = new Task({ ...req.body, owner: req.user._id });

  try {
    const task = await newTask.save();

    res.status(201).json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
});

router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // Alternative below
    // const tasks = await Task.find(match);

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort: sort,
        },
      })
      .execPopulate();
    res.json(req.user.tasks);

    res.json({
      status: 'success',
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        error: 'No task id is found',
      });
    }

    res.json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['completed', 'description'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.json({
      status: 'fail',
      error: 'Tasks input fields are invalid',
    });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res
        .status(404)
        .json({ status: 'fail', error: 'Task id not found' });
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.json({ status: 'success', data: task });
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(400).json({ status: 'fail', error: 'No task id is found' });
    }

    res.json({ status: 'success', data: task });
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
});

module.exports = router;
