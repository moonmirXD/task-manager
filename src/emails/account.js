const sg = require('@sendgrid/mail');
const SEND_GRID_API_KEY =
  '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';
sg.setApiKey(SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email, // Change to your recipient
    from: 'arquezaryan@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: `Hello ${name} welcome to task-manager application.`,
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  sg.send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      throw error;
      console.error(error);
    });
};

exports.module = {
  sendWelcomeEmail,
};
