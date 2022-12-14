import React from "react"

import VirtualPaginatedFilterTable from "./generics/VirtualPaginatedFilterTable"
import TextLink from "../atomic/TextLink"
import { IPropsFetchData } from "./generics/VirtualPaginatedFilterTable"

interface IProps {
  initialGeneAnnotations: object[]
  pageTotal: number
}

const InterproIndexTable: React.FC<IProps> = ({ initialGeneAnnotations, pageTotal }) => {
  // Pagination state management
  const [ gaPage, setGaPage ] = React.useState(initialGeneAnnotations)
  const [ pageCount, setPageCount ] = React.useState(pageTotal)
  const [ loading, setLoading ] = React.useState(false)
  const fetchIdRef = React.useRef(0)

  // Table columns
  const columns = React.useMemo(() => [
    {
      Header: "PFAM ID",
      accessor: "label",
      Cell: ({ value }: { value: string }) => (
        <TextLink href={`/interpro/${value}`}>
          {value}
        </TextLink>
      ),
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "GO Terms",
      accessor: "details.go_terms",
      Cell: ({ value: goTerms }: { value: object[] | "-" }) => (
        <ul className="">
          {
            (goTerms.length === 0 || goTerms[0] === "-")
              ? "-"
              : goTerms.join(", ")
          }
        </ul>
      ),
      disableSortBy: true,
    },
  ], [])

  const fetchGaPage = React.useCallback(({ pageSize, pageIndex, queryFilter=null, sortByObject={} }: IPropsFetchData) => {
    const fetchId = ++fetchIdRef.current
    setLoading(true)
    if (fetchId === fetchIdRef.current) {
      let apiUrl = `/api/interpro?pageIndex=${pageIndex}&pageSize=${pageSize}`
      if (queryFilter) {
        apiUrl += `&queryFilter=${queryFilter}`
      }
      if (Object.keys(sortByObject).length > 0) {
        apiUrl += `&sortByObject=${JSON.stringify(sortByObject)}`
      }
      fetch(apiUrl)
      .then(res => res.json())
      .then((data) => {
          setGaPage(data.geneAnnotations)
          setPageCount(data.pageTotal)
          setLoading(false)
        })
        .catch(err => console.log(err))
    }
  }, [])

  return (
    <VirtualPaginatedFilterTable
      columns={columns}
      data={gaPage}
      pageCount={pageCount}
      loading={loading}
      fetchData={fetchGaPage}
    />
  )
}

export default InterproIndexTable
