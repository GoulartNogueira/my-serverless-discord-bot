const nacl = require('tweetnacl');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const strBody = event.body; // should be string, for successful sign

  if (!event.headers['test']) {
    // Checking signature (requirement 1.)
    // Your public key can be found on your application in the Developer Portal
    const PUBLIC_KEY = process.env.PUBLIC_KEY;
    const signature = event.headers['x-signature-ed25519'] || event.headers['X-Signature-Ed25519'];
    const timestamp = event.headers['x-signature-timestamp'] || event.headers['X-Signature-Timestamp'];

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + strBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify('invalid request signature'),
      };
    }
  }


  // Replying to ping (requirement 2.)
  const body = JSON.parse(strBody)
  if (body.type == 1) {
    return {
      statusCode: 200,
      body: JSON.stringify({ "type": 1 }),
    }
  }

  // Handle command (send to SNS and split to one of Lambdas)
  if (body.data.name) {
    console.debug('Received command: ' + JSON.stringify(body.data.name));
    var eventText = JSON.stringify(body, null, 2);

    var TOPIC = process.env.TOPIC_ARN;
    console.debug('Publishing event to SNS topic: ' + TOPIC);
    var params = {
        Message: eventText,
        Subject: "Test SNS From Lambda",
        TopicArn: TOPIC,
        MessageAttributes: { "command": { DataType: 'String', StringValue: body.data.name } }
    };
    console.debug('Params: ' + JSON.stringify(params));
    // Create promise and SNS service object
    await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    console.debug('Published to SNS');
    return {
      statusCode: 200,
      body: JSON.stringify({
        "type": 4,
        "data": { "content": "*⏳ Loading...*" }
      })
    }
  }

  return {
    statusCode: 404
  }
}
