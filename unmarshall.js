#!/usr/bin/env node

const {unmarshall} = require('@aws-sdk/util-dynamodb')
const StreamValues = require('stream-json/streamers/StreamValues')
const {Transform, pipeline} = require('stream')
const {EOL} = require('os')


pipeline(
  process.stdin,
  StreamValues.withParser(),
  new Transform({
    objectMode: true,
    transform(obj, encoding, cb) {
      const value = obj.value

      try {
        if (!!value.Items) {
          this.push(JSON.stringify({...value, Items: value.Items.map(unmarshall)}, null, 2))
        } else if (!!value.Item) {
          this.push(JSON.stringify({...value, Item: unmarshall(value.Item)}, null, 2))
        } else {
          this.push(JSON.stringify(unmarshall(value), null, 2))
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
