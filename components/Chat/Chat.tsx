import { Chat as ChatInterface } from '@/interfaces/chat';
import Image from 'next/image';

type Props = {
  chat: ChatInterface;
  isLoading?: boolean;
}

const aiImage = '/images/mad-matt.png';

function Chat({ chat, isLoading }: Props) {
  return (
    <div
      className={`flex ${chat.type === 'question'
        ? 'bg-slate-700 text-white'
        : 'bg-slate-900 text-slate-200'
        } p-5`}
    >
      {chat.type === 'answer' && (
        <Image
          className="w-16 h-16 rounded-full mr-5"
          src={aiImage}
          width={120}
          height={120}
          alt="Mad Matt"
        />
      )}
      {
        isLoading ? (
          <div className="w-full">
            <>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
                <div className="h-4 bg-gray-300 rounded mt-2"></div>
              </div>
            </>
          </div>
        ) : <h6 className={`w-full leading-normal text-slate-200 sm:leading-7 ${chat.type === 'question' ? 'text-end' : ''}`}>
          {chat.text}
        </h6>
      }
    </div>
  )
}

export default Chat