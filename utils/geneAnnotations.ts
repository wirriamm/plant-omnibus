import GeneAnnotation from "../models/geneAnnotation";
import connectMongo from "./connectMongo";

import mapmanLevel1Bins from '/public/data/mapman_level1_bins.json' assert {type: 'json'}
/* Why arrays are imported differently https://stackoverflow.com/a/62499195/10723457 */

interface InputArgs {
  type: string
  pageIndex: number
  pageSize: number
  queryFilter?: string | null
  sortByObject?: object
}

export const getGeneAnnotationsPage = async ({
  type,
  pageIndex = 0,
  pageSize = parseInt(process.env.pageSize!),
  queryFilter = null,
  sortByObject,
}: InputArgs) => {
  connectMongo()
  const queryObject = { type: type }
  if (queryFilter) {
    queryObject["$or"] = [
      { name: { "$regex": new RegExp(queryFilter), "$options": "i" } },
      { label: { "$regex": new RegExp(queryFilter), "$options": "i" } },
    ]
  }
  const geneAnnotations = await GeneAnnotation.find(queryObject)
    .sort(sortByObject)
    .skip(pageIndex * pageSize)
    .limit(pageSize)
  const numGeneAnnotations = await GeneAnnotation.countDocuments(queryObject)
  /*
    NOTE: pageTotal is the number of pages required for the given pageSize,
    which is then needed by react-table's useTable() hook
  */
  const pageTotal = Math.ceil(numGeneAnnotations / pageSize)
  return {
    geneAnnotations: geneAnnotations,
    pageTotal: pageTotal,
  }
}

export const getOneGeneAnnotation = async ({ type, label }) => {
  connectMongo()
  const geneAnnotation = await GeneAnnotation.findOne({ type: type, label: label})
    .populate({
      path: "gene_annotation_buckets",
      select: "ga_id spe_id gene_ids",
      populate: [
        {
          path: "species",
          model: "Species",
          select: "name tax"
        },
        {
          path: "genes",
          model: "Gene",
          select: "label",
        }
      ],
    })
    .lean()
  return geneAnnotation
}

/*
  More specialised functions for specific gene annotation types
*/

export const getMapmanLevel1Bins = async () => {
  return mapmanLevel1Bins
}

interface InputArgs {
  level1Bin: number
  pageIndex: number
  pageSize: number
  queryFilter?: string | null
  sortByObject?: object
}

export const getMapmanSubbinsPage = async ({
  level1Bin,
  pageIndex = 0,
  pageSize = parseInt(process.env.pageSize!),
  queryFilter = null,
  sortByObject,
}: InputArgs) => {
  connectMongo()
  const queryObject = { type: "MAPMAN" }
  if (queryFilter) {
    // NOTE: this is $and not $or like in the getGeneAnnotationPage function
    // This means that user cannot search for Mapman annoation by the full bin label here
    queryObject["$and"] = [
      { name: { "$regex": new RegExp(queryFilter), "$options": "i" } },
      { label: { "$regex": new RegExp(`^${level1Bin}\.`), "$options": "i" } },
    ]
  } else {
    queryObject.label = { "$regex": new RegExp(`^${level1Bin}\.`), "$options": "i" }
  }
  const geneAnnotations = await GeneAnnotation.find(queryObject)
    .sort(sortByObject)
    .skip(pageIndex * pageSize)
    .limit(pageSize)
  const numGeneAnnotations = await GeneAnnotation.countDocuments(queryObject)
  /*
    NOTE: pageTotal is the number of pages required for the given pageSize,
    which is then needed by react-table's useTable() hook
  */
  const pageTotal = Math.ceil(numGeneAnnotations / pageSize)
  return {
    geneAnnotations: geneAnnotations,
    pageTotal: pageTotal,
  }
}
