
import Promise from 'bluebird'
import child_process from 'child_process'
import StreamSplitter from 'stream-splitter'
import LFTransform from './lf-transform'

import {Cancelled} from '../tasks/errors'

import mklog from './log'
const log = mklog('spawn')

function spawn (opts) {
  pre: { // eslint-disable-line
    typeof opts === 'object'
    typeof opts.command === 'string'
    typeof opts.opts === 'object' || opts.opts === undefined
    Array.isArray(opts.args) || opts.args === undefined
    typeof opts.split === 'string' || opts.split === undefined
    typeof opts.ontoken === 'function' || opts.ontoken === undefined
    typeof opts.onerrtoken === 'function' || opts.onerrtoken === undefined
  }

  let emitter = opts.emitter
  let command = opts.command
  let spawn_opts = opts.opts || {}
  let args = opts.args || []
  let split = opts.split || '\n'

  log(opts, `spawning ${command} with args ${args.join(' ')}`)

  let child = child_process.spawn(command, args, spawn_opts)
  let cancelled = false

  if (opts.ontoken) {
    let splitter = child.stdout.pipe(new LFTransform()).pipe(StreamSplitter(split))
    splitter.encoding = 'utf8'
    splitter.on('token', opts.ontoken)
  }

  if (opts.onerrtoken) {
    let splitter = child.stderr.pipe(new LFTransform()).pipe(StreamSplitter(split))
    splitter.encoding = 'utf8'
    splitter.on('token', opts.onerrtoken)
  }

  return new Promise((resolve, reject) => {
    child.on('close', (code, signal) => {
      if (cancelled) {
        reject(new Cancelled())
      } else {
        resolve(code)
      }
    })
    child.on('error', reject)

    if (emitter) {
      emitter.once('cancel', (e) => {
        try {
          cancelled = true
          child.kill('SIGKILL')
        } catch (e) {
          log(opts, `error while killing ${command}: ${e.stack || e}`)
        }
      })
    }
  })
}

export default spawn
