/**
 * A Lambda function that replies to interaction with the result of an API call
 */

const { globalHandler } = require('../handler.js');
// use axios instead of fetch to make the API call
const axios = require('axios');

exports.data = {
  name: 'getapi',
  type: 1,
  description: 'queries an API and replies with the result.'
}

const action = async (body) => {
  // Sample API call
  console.log('Calling API...')
  const res = await axios.get('https://api.github.com/users/alexa')
  console.log('API call complete')
  console.log(res.data)
  let response = {
    "content": "Here's the result of the API call: " + JSON.stringify(res.data)
  }
  return response
}

exports.handler = (event) => {
  globalHandler(event, action)
}
