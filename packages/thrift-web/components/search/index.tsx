// cspell:ignore instantsearch, meilisearch, Meili
import React, { Dispatch, forwardRef, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  useHits,
  useInstantSearch,
} from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import { SearchIcon, X } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { isSmallScreenAtom } from '@/atoms'

if (!process.env.NEXT_PUBLIC_SEARCH || !process.env.NEXT_PUBLIC_SEARCH_KEY)
  throw new Error('Must set search url and key!')

// Update searchClient needs to be destructured and not just assigned
const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_SEARCH!,
  process.env.NEXT_PUBLIC_SEARCH_KEY,
)

type SearchProps = {
  show: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  setShowSearchBox?: Dispatch<SetStateAction<boolean>>
  className?: string
}

const Search = forwardRef<HTMLDivElement, SearchProps>(
  ({ show, setShow, setShowSearchBox, className }, searchRef) => {
    const isSmallScreen = useAtomValue(isSmallScreenAtom)
    return (
      //@ts-ignore
      <InstantSearch indexName="products" searchClient={searchClient}>
        <div className={className} ref={searchRef}>
          <span className="bg-transparent flex h-10 px-3 w-full justify-between rounded-md border border-white/20 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <SearchBox
              onClick={() => setShow(true)}
              submitIconComponent={SearchIcon as any}
              searchAsYouType
              resetIconComponent={X as any}
              classNames={{
                root: 'w-full',
                submit: 'text-foreground my-1 order-1',
                reset: 'order-3',
                form: 'w-full flex justify-between',
                loadingIcon: 'hidden',
                input:
                  'z-1000 h-9 px-3 py-1 order-2 w-[90%] bg-inherit focus-visible:outline-none',
              }}
            />
          </span>
          <div
            className={`p-8 border relative z-1000 top-5 rounded-md w-[90vw] md:w-[50vw] h-[80vh] ${isSmallScreen ? 'bg-transparent border-white/20' : 'thick-glass-effect'} overflow-y-scroll ${show ? '' : ' hidden'}`}
          >
            <CustomHits
              isSmallScreen={isSmallScreen}
              setShow={setShow}
              setShowSearchBox={setShowSearchBox}
            />
            <X
              className="w-fit absolute right-5 top-5 border rounded border-white/20 pointer"
              onClick={() => {
                setShow(false)
                setShowSearchBox && setShowSearchBox(false)
              }}
            />
          </div>
        </div>
      </InstantSearch>
    )
  },
)

Search.displayName = 'Search'

function CustomHits({
  isSmallScreen,
  setShow,
  setShowSearchBox,
}: {
  isSmallScreen: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  setShowSearchBox?: Dispatch<SetStateAction<boolean>>
}) {
  const { hits } = useHits()
  const { results } = useInstantSearch()

  // Initial state before any search is performed
  if (!results || results.query === '') {
    return (
      <div className="my-2">
        <p className="capitalize animate-pulse">
          Please Wait for Search to come online...
        </p>
        <div className="animate-pulse pt-6">
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <div
                className="rounded-md h-12 sm:h-16 sm:text-2xl font-bold text-justify mb-4 break-words bg-foreground/20"
                key={index}
              ></div>
            ))}
        </div>
      </div>
    )
  }

  // Search is performed, but there are no results
  if (hits.length === 0) {
    return (
      <div className="my-2 text-center">
        <p>
          No results for <q>{results.query}</q>.
        </p>
      </div>
    )
  }

  // Search is performed and there are results
  return (
    <div>
      {hits.map((hit) => (
        <Hit
          key={hit.objectID}
          hit={hit}
          isSmallScreen={isSmallScreen}
          setShow={setShow}
          setShowSearchBox={setShowSearchBox}
        />
      ))}
    </div>
  )
}

const Hit = ({
  hit,
  setShow,
  setShowSearchBox,
}: {
  hit: any
  isSmallScreen: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  setShowSearchBox?: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()
  return (
    <article
      className="my-4 p-2 rounded-md text-foreground/70 dark:text-foreground/80 hover:bg-foreground/10 cursor-pointer"
      onClick={() => {
        router.push(`/products/${hit.product_id}`)
        setShow(false) // Close search on navigation
        setShowSearchBox && setShowSearchBox(false)
      }}
      key={hit.product_id}
    >
      <h1 className="font-bold text-md sm:text-lg mb-2">
        <Highlight
          attribute="title"
          hit={hit}
          classNames={{
            root: 'bg-transparent',
            highlighted: 'bg-transparent font-extrabold text-foreground',
          }}
        />
      </h1>
      <p>{hit.description.join('.  ').slice(0, 50)}...</p>
    </article>
  )
}

export default Search
