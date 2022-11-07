/**
 * A Lambda function that replies "hello $name" to interaction
 */

const { globalHandler } = require('../handler.js')

exports.data = {
  name: 'user',
  type: 1,
  description: 'prompts the user for input and replies with the result.',
  options: [
    {
      name: 'name',
      description: 'The name of the user',
      type: 3,
      required: true,
    }
  ]
}

const action = async (body) => {
  // Get the name from the command
  const name = body.data.options[0].value
  console.log('Hello ' + name + '!')
  let response = {
    "content": "Hello " + name + "!"
  }
  console.debug('Returning response: ' + JSON.stringify(response));
  return response
}

exports.handler = (event) => {
  globalHandler(event, action)
}
