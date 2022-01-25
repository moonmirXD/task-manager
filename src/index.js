const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const app = express();
const port = process.env.PORT || 3000;

require('./db/mongoose');

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Sever is up on ${port}`);
});

const Task = require('./models/task');
const User = require('./models/user');

const main = async () => {
  // const task = await Task.findOne({ _id: '61e925bab2200f3098c839f6' });
  // await task.populate('owner').execPopulate();
  // console.log(task);
  // const user = await User.findOne({ _id: '61e9241913fc1013405e9ff8' });
  // await user.populate('tasks').execPopulate();
  // console.log(user.tasks);
};

main();
