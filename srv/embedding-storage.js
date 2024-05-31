const cds = require('@sap/cds')
const { TextLoader } = require('langchain/document_loaders/fs/text')
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const path = require('path')
const { OpenAIUtil } = require('./utils/OpenAIUtil')

// Helper method to convert embeddings to buffer for insertion
let array2VectorBuffer = (data) => {
    const sizeFloat = 4
    const sizeDimensions = 4
    const bufferSize = data.length * sizeFloat + sizeDimensions
  
    const buffer = Buffer.allocUnsafe(bufferSize)
    // write size into buffer
    buffer.writeUInt32LE(data.length, 0)
    data.forEach((value, index) => {
      buffer.writeFloatLE(value, index * sizeFloat + sizeDimensions);
    })
    return buffer
  }

module.exports = class EmbeddingStorage extends cds.ApplicationService {
    init () {
        this.on('storeEmbeddings', async(req) => {
            const { DocumentChunk } = this.entities
            let textChunkEntries = []
            console.log(__dirname)
            //1. get document
            const loader = new TextLoader(path.resolve('db/data/codejam_roadshow_itinerary.txt'))
            const document = await loader.load()

            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 500,
                chunkOverlap: 0,
                addStartIndex: true
            })

            const textChunks = await splitter.splitDocuments(document)
            console.log(`Documents split into ${textChunks.length} chunks.`)

            //2. generate embeddings
            console.log("Generating the vector embeddings for the next chunks.")
            const openai = new OpenAIUtil()
            for (const chunk of textChunks) {
                console.log(chunk.pageContent)
                const embedding = await openai.getEmbedding(chunk.pageContent)
                const entry = {
                    "text_chunk": chunk.pageContent,
                    "metadata_column": loader.filePath,
                    "embedding": array2VectorBuffer(embedding)
                }
                console.log(entry)
                textChunkEntries.push(entry)
            }

            //3. store embeddings into db
            console.log("Inserting text chunks with embeddings into db.")
            const insertStatus = await INSERT.into(DocumentChunk).entries(textChunkEntries)
            if (!insertStatus) {
                throw new Error("Insertion of text chunks into db failed!")
            }
            return `Embeddings stored successfully to db.`

        })

        this.on('deleteEmbeddings', async(req) => {
            const { DocumentChunk } = this.entities
            await DELETE.from(DocumentChunk)
            return "Success!"
        })
        return super.init();
    }
}