// cspell:ignore instantsearch, meilisearch, Meili
import React, { Dispatch, forwardRef, SetStateAction } from 'react'
import Link from 'next/link'
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
    const searchProps = {
      indexName: 'products',
      searchClient,
      catchError: true,
    }
    return (
      // @ts-expect-error Meili's Algolia v4 adapter types differ from InstantSearch's v5 types.
      <InstantSearch {...searchProps}>
        <div
          className={className}
          ref={searchRef}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setShow(false)
              setShowSearchBox?.(false)
            }
          }}
        >
          <span className="flex min-h-11 w-full items-center rounded-md border border-input bg-background/85 backdrop-blur-xl px-3 text-sm text-foreground shadow-sm focus-within:ring-2 focus-within:ring-foreground">
            <SearchBox
              onFocus={() => setShow(true)}
              placeholder="Search products"
              submitIconComponent={SearchIcon as any}
              searchAsYouType
              resetIconComponent={X as any}
              classNames={{
                root: 'w-full',
                submit:
                  'text-foreground min-h-11 min-w-6 order-1 focus-visible:outline-2 focus-visible:outline-foreground',
                reset:
                  'order-3 min-h-11 min-w-6 focus-visible:outline-2 focus-visible:outline-foreground',
                form: 'w-full flex items-center justify-between',
                loadingIcon: 'hidden',
                input:
                  'min-w-0 h-11 px-2 py-1 order-2 w-full bg-inherit text-foreground placeholder:text-foreground/70 focus-visible:outline-none',
              }}
            />
          </span>
          <div
            className={`px-4 pb-4 pt-16 border border-border z-20 rounded-md ${isSmallScreen ? 'relative mt-3 w-full' : 'absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[min(50vw,42rem)]'} max-h-[65svh] min-h-28 bg-popover/90 backdrop-blur-xl text-popover-foreground overflow-y-auto ${show ? '' : ' hidden'}`}
          >
            <CustomHits
              isSmallScreen={isSmallScreen}
              setShow={setShow}
              setShowSearchBox={setShowSearchBox}
            />
            <button
              type="button"
              aria-label="Close search results"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
              onClick={() => {
                setShow(false)
                setShowSearchBox?.(false)
              }}
            >
              <X aria-hidden="true" />
            </button>
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
  const { results, status } = useInstantSearch()
  if (status === 'error')
    return (
      <p role="alert">
        Search is temporarily unavailable. Please try again or{' '}
        <Link href="/products" className="underline">
          browse products
        </Link>
        .
      </p>
    )
  if (status === 'loading' || status === 'stalled')
    return <p role="status">Searching products…</p>

  // Initial state before any search is performed
  if (!results && (results as any)?.query) {
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

import { CldImage } from 'next-cloudinary'

// ... (rest of the file remains the same until the Hit component)

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
  // Find the display image or fall back to the first image
  const displayImage =
    hit.media?.find((m: any) => m.is_display_image) || hit.media?.[0]

  const description = Array.isArray(hit.description)
    ? hit.description.join('. ')
    : typeof hit.description === 'string'
      ? hit.description
      : ''

  return (
    <Link
      href={`/products/${hit.product_id}`}
      className="my-4 p-2 rounded-md text-foreground hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground flex items-center gap-4"
      onClick={() => {
        setShow(false)
        setShowSearchBox?.(false)
      }}
      key={hit.product_id}
    >
      {displayImage && (
        <div className="w-16 h-16 relative flex-shrink-0">
          <CldImage
            src={displayImage.filepath}
            alt={hit.title}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      <div className="flex-grow">
        <h2 className="font-bold sm:text-lg mb-1">
          <Highlight
            attribute="title"
            hit={hit}
            classNames={{
              root: 'bg-transparent',
              highlighted: 'bg-transparent font-extrabold text-foreground',
            }}
          />
        </h2>
        <p className="text-sm sm:text-base">{description.slice(0, 70)}...</p>
      </div>
    </Link>
  )
}

export default Search
