/**
 * A Lambda function that replies to interaction with the result of an API call
 * @param {Object} body - The body of the interaction
 * @returns {Object} - The response to the interaction
 */

const { globalHandler } = require('../handler.js');

// use axios instead of fetch to make the API call
const axios = require('axios');

// Install using: yarn add @aws-sdk/client-secrets-manager
// const {SecretsManagerClient, GetSecretValueCommand} = require("@aws-sdk/client-secrets-manager");
// Use Bearer token for authentication
// const client = new SecretsManagerClient({region: 'us-east-1'});
// const secret_name = "promptly/bubble/admin";
// const PROMPTLY_TOKEN = await client.send(new GetSecretValueCommand({SecretId: secret_name}));

// instead, use hardcoded token
const PROMPTLY_TOKEN = XXXXXXXXXXXXXXXXXXXXXXX


exports.data = {
  name: 'promptly',
  type: 1,
  description: 'Improves your prompt.',
  options: [
    {
      name: 'prompt',
      description: 'The prompt to be improved.',
      type: 3,
      required: true,
    },
    {
      name: 'mode',
      description: 'The mode to use.',
      type: 3,
      required: false,
      choices: [
        {
          name: 'create 💡',
          value: 'create'
        },
        {
          name: 'improve 🧠',
          value: 'improve'
        }
      ]
    }
  ]
}

const action = async (body) => {
  // Extract the original prompt from the command
  const prompt = body.data.options[0]?.value
  if (!prompt) {
    return {
      type: 4,
      data: {
        content: 'Please provide a prompt.'
      }
    }
  }
  console.log('Improving prompt: ' + prompt)
  // Call the API (https://promptly.pro/api/1.1/wf/generate_prompt)
  const config = {
    headers: {
      'Authorization': 'Bearer ' + PROMPTLY_TOKEN
    }
  }
  console.debug('Calling API with config: ' + JSON.stringify(config))
  try {
  const res = await axios.post('https://promptly.pro/version-test/api/1.1/wf/generate_prompt',
    {
      input_prompt: prompt,
      mode: body.data.options[1]?.value || 'create',
      temperature: 0.7,
      channel_origin: "discord",
      // get user id from discord
      user_id: body.member?.user?.id,
      // get guild id from discord

      // raw_body: JSON.stringify(body)
    },
    config).then((res) => {
      console.log('API call complete')
      console.log(res.data)

      // Extract the improved prompt from the response
      const improvedPrompts = res.data.response?.results
      if (!improvedPrompts) {
        // if error: Out of credits
        if (res.data.response?.error.toLowerCase().includes('out of credits')) {
            return {
              type: 4,
              data: {
                content: 'Out of credits.\nPlease visit https://promptly.pro to refill your credits.'
              }
            }
          }
        throw new Error('Improvement failed')
      }
      console.log('Improved prompts: ' + improvedPrompts)

      return improvedPrompts
    }).catch((err) => {
        console.error(err)
        throw new Error('Improvement failed')
      })

      // Build the response
      let response = {
        "content": res.join('\n')
      }
      console.debug('Returning response: ' + JSON.stringify(response));
      return response
    } catch (err) {
      console.error(err)
      return {
        type: 4,
        data: {
          content: 'Improvement failed.'
        }
      }
    }
}

exports.handler = (event) => {
  globalHandler(event, action)
}
