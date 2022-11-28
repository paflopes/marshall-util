#!/usr/bin/env node

const {marshall} = require('@aws-sdk/util-dynamodb')
const StreamValues = require('stream-json/streamers/StreamValues')
const {Transform, pipeline} = require('stream')
const {EOL} = require('os')
const {program} = require('commander')

program
  .option('-t, --table-name <DynamoDB Table Name>')

program.parse()

const opts = program.opts()

pipeline(
  process.stdin,
  StreamValues.withParser(),
  new Transform({
    objectMode: true,
    transform(obj, encoding, cb) {
      try {
        if (!!opts.tableName) {
          this.push(JSON.stringify({TableName: opts.tableName, Item: marshall(obj.value)}, null, 2))
        } else {
          this.push(JSON.stringify(marshall(obj.value), null, 2))
        }

        this.push(EOL)
        cb()
      } catch (e) {
        cb(e)
      }
    }
  }),
  process.stdout,
  (err) => {
    if (!!err) console.error(err)
  }
)
