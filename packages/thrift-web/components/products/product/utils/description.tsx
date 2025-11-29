export const Description = ({ description }: { description: string[] }) => (
  <div className="h-full my-8 sm:my-16">
    <h3 className="w-full mx-auto text-xl lg:text-2xl mb-8 sm:mb-16 font-bold">
      About This Product
    </h3>
    <div className="flex flex-col justify-between">
      {description && (
        <div className="gap-2 flex flex-col mb-8">
          {description?.map((desc, index) => (
            <p
              className="text-md break-words font-light md:text-xl"
              key={index}
            >
              {desc}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
)
