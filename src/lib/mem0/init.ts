import { Memory } from 'mem0ai/oss';

const memConfig = {
    version: 'v1.1',
    embedder: {
      provider: 'openai',
      config: {
        apiKey: process.env.OPENAI_API_KEY ,
        model: 'text-embedding-3-small',
      },
    },
    vectorStore: {
      provider: 'qdrant',
      config: {
        host:"localhost",
        port:6333
      },
    },
    llm: {
      provider: 'openai',
      config: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4.1',
      },
    },
    "graph_store":{
        "provider":"neo4j",
        "config":{
            "url":process.env.NEO4J_URL,
            "username":process.env.NEO4J_USERNAME,
            "password":process.env.NEO4J_PASSWORD
        }
    },
  }


const memory = new Memory(memConfig);

export default memory