const OpenAI = require('openai')

class OpenAIUtil {
    constructor() {
        this.openai = new OpenAI()
    }

    async getEmbedding(input) {
        const response = await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: input,
            encoding_format: "float"
        })
        return response.data[0].embedding
    }
    
    async chat(messages) {
        const response = await this.openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo"
        })
        return response.choices[0].message.content
    }
}

module.exports.OpenAIUtil = OpenAIUtil