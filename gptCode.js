const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios'); // For making HTTP requests

class gptCode extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;

            // Send the message to the LLM and get a response
            const replyText = await this.getLLMResponse(userMessage);

            // Send the LLM's response back to the user
            await context.sendActivity(MessageFactory.text(replyText, replyText));

            // Ensure the next BotHandler is run
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            await next();
        });
    }

    async getLLMResponse(userMessage) {
        try {
            // OpenAI API integration
            const apiKey = 'your_openai_api_key'; // Replace with your OpenAI API key
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4', // Specify the LLM model
                    messages: [{ role: 'user', content: userMessage }],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );
            return response.data.choices[0].message.content; // Return the LLM's response
        } catch (error) {
            console.error('Error communicating with LLM:', error);
            return 'Sorry, I am having trouble responding at the moment.';
        }
    }
}

module.exports.gptCode = gptCode;
