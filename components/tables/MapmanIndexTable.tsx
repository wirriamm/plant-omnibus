import React from "react"

import VirtualPaginatedTable from "./generics/VirtualPaginatedTable"
import TextLink from "../atomic/TextLink"

interface IProps {
  initialGeneAnnotations: object[]
  pageTotal: number
}

const MapmanIndexTable: React.FC<IProps> = ({ initialGeneAnnotations, pageTotal }) => {
  // Pagination state management
  const [ gaPage, setGaPage ] = React.useState(initialGeneAnnotations)
  const [ pageCount, setPageCount ] = React.useState(pageTotal)
  const [ loading, setLoading ] = React.useState(false)
  const fetchIdRef = React.useRef(0)

  // Table columns
  const columns = React.useMemo(() => [
    {
      Header: "Bincode",
      accessor: "label",
      Cell: ({ value }: { value: string }) => (
        <TextLink href={`/mapman/${value}`}>
          {value}
        </TextLink>
      ),
    },
    {
      Header: "Bin name",
      accessor: "name",
    },
    {
      Header: "Description",
      accessor: "details.desc",
    },
  ], [])

  const fetchGaPage = React.useCallback(({ pageSize, pageIndex }: { pageSize: number; pageIndex: number }) => {
    const fetchId = ++fetchIdRef.current
    setLoading(true)
    if (fetchId === fetchIdRef.current) {
      fetch(`/api/mapman?pageIndex=${pageIndex}&pageSize=${pageSize}`)
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
    <VirtualPaginatedTable
      columns={columns}
      data={gaPage}
      pageCount={pageCount}
      loading={loading}
      fetchData={fetchGaPage}
    />
  )
}

export default MapmanIndexTable
