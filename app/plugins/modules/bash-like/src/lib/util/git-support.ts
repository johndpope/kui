/*
 * Copyright 2018 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Debug from 'debug'
const debug = Debug('plugins/bash-like/util/git-support')

import { join } from 'path'
import { exec, spawn } from 'child_process'

import { inBrowser } from '../../../../../../build/core/capabilities'
import { injectCSS as inject } from '../../../../../../build/webapp/util/inject'

/**
 * Load the CSS for diff2html
 *
 */
export const injectCSS = async () => {
  if (inBrowser()) {
    await Promise.all([
      inject({ css: require('../../../node_modules/diff2html/dist/diff2html.min.css'), key: 'diff2html.css' }),
      inject({ css: require('../../../web/css/my-diff2html.css'), key: 'mydiff2html.css' })
    ])
  } else {
    await Promise.all([
      inject(join(__dirname, '../../../node_modules/diff2html/dist/diff2html.min.css')),
      inject(join(__dirname, '../../../web/css/my-diff2html.css'))
    ])
  }
}

/**
 * Return git status, usually for consumption by a git commit
 *
 */
export const status = (commentPrefix = '# ') => new Promise((resolve, reject) => {
  const status = exec('git status', (err, status, stderr) => {
    if (err) {
      console.error(stderr)
      reject(err)
    } else {
      debug('status', status)
      const commentedStatus = status
        .split(/\n/)
        .map(line => `${commentPrefix}${line}`)
        .join('\n')

      resolve(commentedStatus)
    }
  })
})

/**
 * Find the .git "toplevel" directory
 *
 */
export const toplevel = (): Promise<string> => new Promise((resolve, reject) => {
  const status = exec('git rev-parse --show-toplevel', (err, toplevel, stderr) => {
    if (err) {
      console.error(stderr)
      reject(err)
    } else {
      resolve(toplevel.trim())
    }
  })
})

/**
 * @return the current branch
 *
 */
export const branch = (): Promise<string> => new Promise((resolve, reject) => {
  const status = exec('git rev-parse --abbrev-ref HEAD', (err, branch, stderr) => {
    if (err) {
      console.error(stderr)
      reject(err)
    } else {
      resolve(branch.trim())
    }
  })
})

/**
 * @return "On branch <branch>"
 *
 */
export const onbranch = (): Promise<Element> => {
  const currentBranch = branch()

  return new Promise<Element>(async resolve => {
    const span = document.createElement('span')
    span.appendChild(document.createTextNode('On branch '))

    const strong = document.createElement('strong')
    strong.innerText = await currentBranch
    span.appendChild(strong)

    resolve(span)
  })
}
