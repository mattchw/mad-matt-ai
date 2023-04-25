import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from '@/helpers/pinecone';
import { processMarkDownFiles } from '@/utils/markdown';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

const directoryPath = 'db/notion';

(async () => {
  try {
    const rawDocs = await processMarkDownFiles(directoryPath);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    console.log('creating vector store...');
    const embeddings = new OpenAIEmbeddings();
    console.log('changing pinecone index...');
    const index = (await pinecone).Index(PINECONE_INDEX_NAME);

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE,
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
  console.log('import documents into Pinecone completed');
})();
