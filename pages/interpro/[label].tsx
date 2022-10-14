import React from "react"
import Head from "next/head"
import { NextPage } from "next"
import { useRouter } from "next/router"

import Layout from "../../components/Layout"
import Header1 from "../../components/atomic/texts/Header1"
import InterproShowTable from "../../components/tables/InterproShowTable"
import { getOneGeneAnnotation } from "../../utils/geneAnnotations"

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const geneAnnotation = await getOneGeneAnnotation({ type: "INTERPRO", label: params.label })

  return {
    props: {
      geneAnnotation: JSON.parse(JSON.stringify(geneAnnotation))
    }
  }
}

interface IProps {
  geneAnnotation: object
}

const InterproShowPage: NextPage<IProps> = ({ geneAnnotation }) => {
  const router = useRouter()
  const label = router.query.label

  return (
    <Layout>
      <Head>
        <title>PFAM {label}</title>
      </Head>

      <Header1>PFAM {label}</Header1>
      <p>{geneAnnotation.name}</p>
      <p>
        GO Terms: {geneAnnotation.details.go_terms.join(", ")}
      </p>

      {JSON.stringify(geneAnnotation.gene_annotation_buckets[0], undefined, 2)}

      <InterproShowTable data={geneAnnotation.gene_annotation_buckets} />
    </Layout>
  )
}

export default InterproShowPage
