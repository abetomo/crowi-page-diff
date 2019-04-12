#!/usr/bin/env node

'use strict'

if (process.argv.length !== 5) {
  console.error('crowi-page-diff PAGE_ID OLD_REVISION_ID NEW_REVISION_ID')
  process.exit(1)
}

const request = require('request')
const diff = require('diff')

const url = process.env.CROWI_URL
const token = process.env.CROWI_TOKEN

const pageId = process.argv[2]
const oldId = process.argv[3]
const newId = process.argv[4]

const revisionsGetApiUrl = `${url}/_api/revisions.get`

const baseParams = {
  access_token: token,
  page_id: pageId
}

const fetchWiki = (revisionId) => {
  const options = {
    url: revisionsGetApiUrl,
    qs: Object.assign({ revision_id: revisionId }, baseParams)
  }
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err)
      resolve(JSON.parse(body).revision)
    })
  })
}

(async () => {
  const oldPage = await fetchWiki(oldId)
  const newPage = await fetchWiki(newId)
  console.log(diff.createPatch(
    newPage.path,
    oldPage.body + '\n',
    newPage.body + '\n',
    oldPage.createdAt,
    newPage.createdAt
  ))
})()
