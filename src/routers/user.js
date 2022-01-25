const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const User = require('../models/user');
const { sendWelcomeEmail } = require('../emails/account');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// const sharp = require('sharp');

// const { response } = require('express');

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    const newUser = await user.save();
    const token = await newUser.generateAuthToken();
    await sendWelcomeEmail(newUser.email, newUser.name);
    res.status(201).json({
      status: 'success',
      data: newUser,
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.json({ status: 'success', data: user, token });
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });

    await req.user.save();
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'fail', error });
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'fail', error });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        error: 'No user found',
      });
    }
    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      error,
    });
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['email', 'age', 'name', 'password'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).json({ status: 'fail', error: 'Invalid update fields' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.json({ status: 'success', data: req.user });
  } catch (error) {
    res.json(400).json({ status: 'fail', error });
  }
});

// router.delete('/users/:id', async (req, res) => {
//   try {
//     const user = await User.findOneAndDelete({ _id: req.params.id });

//     if (!user) {
//       res.status(400).json({ status: 'fail', error: 'No user id is found' });
//     }

//     res.json({ status: 'success', data: user });
//   } catch (error) {
//     res.status(400).json({ status: 'fail', error });
//   }
// });

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json({ status: 'success', data: req.user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return callback(new Error('File must be picture'));
    }
    callback(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    // const buffer = sharp(req.file.buffer)
    //   .resize({ width: 250, height: 250 })
    //   .png()
    //   .toBuffer();
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.json({ status: 'success' });
  },
  (error, req, res, next) => {
    res.status(400).json({ status: 'fail', error: error.message });
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new error();
    }

    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send({ error });
  }
});

module.exports = router;
