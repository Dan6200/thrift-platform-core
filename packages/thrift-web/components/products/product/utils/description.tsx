export const Description = ({ description }: { description: string[] }) => (
  <div className="h-full">
    <h3 className="w-full mx-auto text-xl lg:text-2xl mb-6 lg:mb-12 font-bold text-center">
      About This Product
    </h3>
    <div className="flex flex-col justify-between">
      {description && (
        <div className="gap-4 flex flex-col mb-8">
          {description?.map((desc, index) => (
            <p
              className="text-md break-words font-light md:text-xl"
              key={index}
            >
              {/* remove &nbsp; that breaks ui */}
              {desc.replace(/\u00A0/, ' ')}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
)
