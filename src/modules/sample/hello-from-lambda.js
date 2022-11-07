/**
 * A Lambda function that replies to interaction with static string
 */

const { globalHandler } = require('../handler.js')

exports.data = {
  name: 'hello',
  type: 1,
  description: 'replies with hello world.'
}

const action = async (body) => {
  // May do something here with body
  // Body contains Discord command details
  console.log('Hello world!')
  let response = {
    "content": "Hello from Lambda!"
  }
  console.debug('Returning response: ' + JSON.stringify(response));
  return response
}

exports.handler = (event) => {
  console.log('Hello from lambda!!')
  globalHandler(event, action)
}
