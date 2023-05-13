import type { NextApiRequest, NextApiResponse } from 'next';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { createOpenAIClient } from '@/helpers/openai';
import { pinecone } from '@/helpers/pinecone';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  try {
    const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

    const index = (await pinecone).Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    const model = createOpenAIClient();
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);

    const response = await chain.call({
      query: sanitizedQuestion,
    });

    console.log('response', response);

    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error?.message || 'Unknown error.' });
  }
}