import Image from 'next/image'

export function HeroLoading({
  children,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="h-screen">
      <Image
        width="1920"
        height="1080"
        src="/laptop-unboxing-hd.jpg" // Public ID of your video
        className="z-0 absolute inset-0 top-0 h-screen w-full object-cover"
        alt="unboxing laptop placeholder"
        priority
      />
      <div
        className={
          'text-white flex flex-col gap-16 md:gap-32 text-3xl sm:text-8xl capitalize p-8 md:p-16 bg-black/50 inset-0 top-0 absolute font-extrabold z-5 h-full text-left items-start justify-end'
        }
      >
        {children}
      </div>
    </div>
  )
}
