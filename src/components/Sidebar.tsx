// components/Sidebar.tsx
'use client'

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Menu,
  Smile,
  Gamepad2,
  HelpCircle,
  Cpu,
  Star,
  Film,
} from 'lucide-react'
import Link from 'next/link'

const topics = [
  { name: 'Internet Culture (Viral)', icon: <Smile className='w-4 h-4' /> },
  { name: 'Games', icon: <Gamepad2 className='w-4 h-4' /> },
  { name: 'Q&As', icon: <HelpCircle className='w-4 h-4' /> },
  { name: 'Technology', icon: <Cpu className='w-4 h-4' /> },
  { name: 'Pop Culture', icon: <Star className='w-4 h-4' /> },
  { name: 'Movies & TV', icon: <Film className='w-4 h-4' /> },
]

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className='p-2'>
        <Menu className='w-6 h-6' />
      </SheetTrigger>
      <SheetContent side='left' className='w-64 sm:w-80'>
        <h2 className='text-lg font-semibold mb-4'>Topics</h2>
        <ul className='space-y-3'>
          {topics.map((topic) => (
            <li key={topic.name} className='flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md'>
              {topic.icon}
              <span>{topic.name}</span>
            </li>
          ))}
        </ul>

        <div className='mt-6'>
          <h2 className='text-lg font-semibold mb-4'>Resources</h2>
          <ul className='space-y-3'>
            <li className='hover:bg-gray-100 p-2 rounded-md'>
              <Link href='/about'>About Reddit</Link>
            </li>
            <li className='hover:bg-gray-100 p-2 rounded-md'>
              <Link href='/advertise'>Advertise</Link>
            </li>
            <li className='hover:bg-gray-100 p-2 rounded-md flex justify-between'>
              <span>Reddit Pro</span>
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
