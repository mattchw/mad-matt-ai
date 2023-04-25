import { Chat as ChatInterface } from '@/interfaces/chat';
import Image from 'next/image';

type Props = {
  chat: ChatInterface;
}

const aiImage = '/images/mad-matt.png';

function Chat({ chat }: Props) {
  return (
    <div
      className={`flex ${chat.type === 'question'
        ? 'bg-slate-700 text-white'
        : 'bg-slate-900 text-slate-200'
        } p-5`}
    >
      {chat.type === 'answer' && (
        <Image
          className="w-16 h-16 rounded-full mr-3"
          src={aiImage}
          width={120}
          height={120}
          alt="Mad Matt"
        />
      )}
      <h6 className={`w-full leading-normal text-slate-200 sm:leading-7 ${chat.type === 'question' ? 'text-end' : ''}`}>
        {chat.text}
      </h6>
    </div>
  )
}

export default Chat