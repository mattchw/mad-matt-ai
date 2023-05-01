import { useRef, useState, useEffect } from 'react';
import { useWhisper } from '@chengsokdara/use-whisper'

// components
import Chat from '@/components/Chat/Chat';

// interfaces
import { Chat as ChatInterface } from '@/interfaces/chat';

export default function Home() {
  const DEFAULT_QUERY = 'What is Javascript? Explain it to me like I\'m 5.';

  const [query, setQuery] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [chats, setChats] = useState<ChatInterface[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const {
    transcribing,
    transcript,
    startRecording,
    stopRecording,
  } = useWhisper({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
    streaming: true,
    timeSlice: 1_000, // 1 second
    removeSilence: true,
    whisperConfig: {
      language: 'en',
    },
  })

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // when transcript.text changes, set the query
  useEffect(() => {
    if (!transcribing && transcript.text) {
      setQuery(transcript.text);
    }
  }, [transcribing, transcript.text]);

  async function handleSearch() {
    let text = query.trim();
    if (!text) {
      text = DEFAULT_QUERY;
    }

    setChats((prevChats) => [...prevChats, {
      type: 'question',
      text,
    }, {
      type: 'answer',
      text: '...',
    }]);
    setLoading(true);

    const question = text;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(response.statusText);
      }

      const answer = await response.json();

      if (answer.text) {
        setChats((prevChats) => {
          const newChats = [...prevChats];
          if (newChats.length > 0) {
            const lastChat = newChats[newChats.length - 1];
            if (lastChat.type === 'answer') {
              lastChat.text = answer.text;
            }
          }
          return newChats;
        });
      }
      setQuery('');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSearch();
    } else {
      return;
    }
  };

  const handleRecord = () => {
    setIsRecording((prevIsRecording) => !prevIsRecording);
    startRecording();
  };

  const handleStop = () => {
    setIsRecording((prevIsRecording) => !prevIsRecording);
    stopRecording();
  };

  return (
    <>
      <div className="flex flex-col h-screen max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 py-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center text-slate-100">
            Chat With Mad Matt
          </h1>
          <h5 className="leading-[1.1] tracking-tighter text-center text-slate-300">
            Think of it as a chatbot version of me, with all my Notion knowledge
          </h5>
        </div>
        <div className="flex-grow pb-20">
          <div className="flex flex-col gap-2">
            {chats.map((chat, index) => (
              <Chat key={index} chat={chat} isLoading={
                loading && index === chats.length - 1
              } />
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full p-4 fixed bottom-0">
        <div className="flex w-full max-w-5xl items-center mx-auto">
          <input
            ref={inputRef}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-700 py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 mr-2"
            type="text"
            placeholder={DEFAULT_QUERY}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            disabled={loading || isRecording || transcribing}
          />
          <button
            onClick={handleSearch}
            disabled={loading || isRecording || transcribing}
            className="active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 h-10 py-2 px-4 mr-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
          <button
            onClick={isRecording ? handleStop : handleRecord}
            disabled={loading || transcribing}
            className="active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 h-10 py-2 px-4"
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}