const cds = require('@sap/cds')
const { OpenAIUtil } = require('./utils/OpenAIUtil')

const userQuery = 'In which city are Thomas Jung and Rich Heilman on April, 19th 2024?'
const instructions = 'Return the result in json format. Display the keys, the topic and the city in a table form.'

module.exports = class RoadshowService extends cds.ApplicationService {
    init() {
        this.on('getRagResponse', async () => {
            //1. get embedding for input
            const openai = new OpenAIUtil()
            const embedding = await openai.getEmbedding(userQuery)

            //2. retrieve relevant contents
            const db = await cds.connect.to('db')
            const { DocumentChunk } = db.entities;
            const contents = await SELECT.from(DocumentChunk)
                                .limit(3)
                                .where`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) > 0.7`
            console.log(contents)
            let context;
            contents.forEach(content => {
                context = context + '\n' + content.text_chunk
            })
            console.log(context)
            
            //3. get response
            const messages = [
                { role: 'system', content: context },
                { role: 'user', content: userQuery }
            ]
            const response = await openai.chat(messages)
            return response

        })

        this.on('executeSimilaritySearch', async () => {
            //1. get embedding for input
            const openai = new OpenAIUtil()
            const embedding = await openai.getEmbedding(userQuery)

            //2. retrieve relevant contents
            const db = await cds.connect.to('db')
            const { DocumentChunk } = db.entities;
            const contents = await SELECT.from(DocumentChunk)
                                .columns `text_chunk, 
                                          cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) as cosine_similarity,
                                          l2Distance(embedding, to_real_vector(${JSON.stringify(embedding)})) as l2Distance`
                                .limit(4) 
                                // .where`cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) > 0.7`
                                .orderBy `cosine_similarity(embedding, to_real_vector(${JSON.stringify(embedding)})) desc`
            // console.log(contents)
            return contents
        })
        return super.init()
    }
}