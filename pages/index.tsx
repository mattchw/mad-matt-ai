import { useRef, useState, useEffect } from 'react';

// components
import Chat from '@/components/Chat/Chat';

// interfaces
import { Chat as ChatInterface } from '@/interfaces/chat';

export default function Home() {
  const DEFAULT_QUERY = 'What is Javascript? Explain it to me like I\'m 5.';

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [chats, setChats] = useState<ChatInterface[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSearch() {
    let text = query.trim();
    if (!text) {
      text = DEFAULT_QUERY;
    }

    setChats((prevChats) => [...prevChats, {
      type: 'question',
      text,
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
        setChats((prevChats) => [...prevChats, {
          type: 'answer',
          text: answer.text,
        }]);
      }
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
              <Chat key={index} chat={chat} />
            ))}
          </div>
          {loading && (
            <div className="mt-3">
              <>
                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </>
            </div>
          )}
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
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 h-10 py-2 px-4"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}