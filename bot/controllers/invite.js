const BaseController = require('../baseController.js');
const Command = require('../baseCommand.js');
const models = require('../../db/models');
const uuidv4 = require('uuid/v4');
// const nodemailer = require('nodemailer');

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
      // const welcomeUser = 'Welcome to the Full Sail Armanda';
      const userExist = 'Error user is already here';
      models.Member.findOne({ where: { email } }).then((matchedUserData) => {
        if (matchedUserData === null) {
          // if the user doesn't exist in channel
          models.Member.create({
            newMember: message.author.id,
            email,
            uuid: uuidv4(),
            verified: 1,
          });
          message.guild.channels.get('372940806106906627').createInvite().then(invite =>
            message.author.send(invite.url),
          );
        } else {
          message.reply(userExist);
        }
      });
    }
  }
}

module.exports = inviteController;
