import React, { Suspense } from 'react'

import { useArticleSearch } from '@/hooks/useArticleSearch'

import { Select } from './select'
import { Button } from './server'

export function Search() {
  const {
    categories,
    selectedCategory,
    selectCategory,
    selectedYear,
    selectYear,
    resetFilters,
    updateSearchTerm,
  } = useArticleSearch()

  const categoriesOptions = React.useMemo(
    () =>
      categories?.map(category => ({
        value: category?.attributes?.slug ?? '',
        label: category?.attributes?.name ?? '',
      })) ?? [],
    [categories]
  )

  const searchDebounce = React.useRef<ReturnType<typeof setTimeout>>()
  const [search, setSearch] = React.useState('')

  const handleSearch = React.useCallback(
    (term: string) => {
      clearTimeout(searchDebounce.current)
      setSearch(term)

      searchDebounce.current = setTimeout(() => {
        updateSearchTerm(term)
      }, 2000)
    },
    [updateSearchTerm]
  )

  // this is a hack, as i've started bloggin in 2023
  const YEARS = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: currentYear - 2023 + 1 }, (_, i) => {
      const year = (currentYear - i).toString()
      return { value: year, label: year }
    })
  }, [])

  return (
    <div className="w-full flex flex-row flex-wrap gap-2 py-3 border-b border-slate-800/30 font-roboto">
      <input
        type="text"
        placeholder="Search"
        className="border border-slate-900/20 p-2 text-sm font-light basis-full @2xl:basis-auto @2xl:min-w-[330px] focus:outline-none focus-visible:border-slate-950"
        value={search}
        onChange={e => handleSearch(e.target.value)}
      />

      <Select
        options={YEARS}
        selected={selectedYear}
        onChange={selectYear}
        placeholder="Year"
        reset="All years"
      />

      <Select
        options={categoriesOptions}
        selected={selectedCategory}
        onChange={selectCategory}
        placeholder="Category"
        reset="All categories"
      />

      <Button onClick={resetFilters}>Clear filters</Button>
    </div>
  )
}
