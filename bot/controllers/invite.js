const BaseController = require('../baseController.js');
const Command = require('../baseCommand.js');
const models = require('../../db/models');
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const util = require('apex-util');


class inviteController extends BaseController {
  constructor(message) {
    // Call BaseController constructor
    super(message);

    // Aliasing 'this' as controller to allow for binding in actions
    const controller = this;

    // Array of all commands, see baseCommand.js for prototype
    this.commands = [
      new Command(
        '!invite',
        '!invite <email_address>',
        'invite Message',
        'Resend the welcome message you recieved when you joined the server.',
        this.inviteAction.bind(controller),
        'dm',
      ),
    ];
  }

  // this message will be sent to the user's dm with their username
  inviteAction() {
    const { message } = this;
    const validDomains = ['student.fullsail.edu', 'fullsail.edu', 'fullsail.com'];
    const email = message.parsed[1].toLowerCase();
    const emailDomain = email.split('@').pop();
    if (validDomains.includes(emailDomain)) {
      const invite = message.guild.channels.get('372940806106906627').createInvite()
        .then(invite => invite.url);
      // message.author.send(invite.url));

      // TODO: Set `time` prop to 600000 (10min)
      const collector = message.channel.createMessageCollector(
        m => m.content.includes(invite));
      collector.on('collect', (m) => {
        const verifyUser = 'Welcome aboard, Crewmate!';
        const userAlredyOnSystem = 'This email has already been verified to a discord user.';
        models.Member.findOne({ where: { email } }).then((matchedUserData) => {
          if (matchedUserData === null) {
            // no existing record found
            models.Member.create({
              discorduser: m.author.id,
              email,
              uuid: uuidv4(),
              verified: 1,
            });
            // mapping guild roles to find the crew role id
            message.reply(verifyUser);
          } else {
            // existing record found
            message.reply(userAlredyOnSystem);
          }
        });
        util.log('Collected', m.content, 3);
      });
      // Set up Nodemailer to send emails through gmail
      const sendVerifyCode = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASS,
        },
      });
      // Nodemailer email recipient & message
      // TODO: Build email template
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Armada Verification Code',
        html: `<table><tr><td><p>Enter the code below into Discord, in the same channel on the Armada Server. Verification will timeout after ${invite} minutes from first entering the !verify command.</p></td></tr></table>`,
      };
      // Call sendMail on sendVerifyCode
      // Pass mailOptions & callback function
      sendVerifyCode.sendMail(mailOptions, (err, info) => {
        const errorMsg = 'Oops, looks like the email can not be sent. It\'s not you, it\'s me. Please reach out to a moderator to help you send a invite.';
        if (err) {
          message.reply(errorMsg);
          util.log('Email not sent', err, 3);
        } else {
          util.log('Email details', info, 3);
        }
      });

      return 'you have sent the invite';
    } else {
      return 'Sorry, I can only invite Full Sail University email addresses.';
    }
  }
}

module.exports = inviteController;
