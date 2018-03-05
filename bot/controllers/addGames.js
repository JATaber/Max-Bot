const BaseController = require('../baseController.js');
const Command = require('../baseCommand.js');


class AddGameController extends BaseController {
  constructor(message) {
    // Call BaseController constructor
    super(message);

    // Aliasing 'this' as controller to allow for binding in actions
    const controller = this;

    // Array of all commands, see baseCommand.js for prototype
    this.commands = [
      new Command(
        '!addGame',
        '!addGame <game_name>',
        'Add A Game',
        'Add a new text and voice channel for a game with preset permissions.',
        this.addGameAction.bind(controller),
      ),
    ];
  }

  // this message will be sent to the user's dm with their username
  addGameAction() {
    const { message } = this;
    return `This should work, ${message.author.username}`;
  }
}

module.exports = AddGameController;
