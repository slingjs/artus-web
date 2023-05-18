import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { AppConfig, ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_FILE_SYSTEM } from '../../types'
import fsExtra from 'fs-extra'
import path from 'path'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'
import { fileNewLineMark, fileNewLineOnEOFPattern } from '../../constants'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_FILE_SYSTEM,
  scope: ScopeEnum.SINGLETON
})
export class FileCache {
  @Inject(ArtusInjectEnum.Application)
  private app: ArtusApplication

  get folder() {
    return path.resolve((this.app.config as AppConfig).framework.cacheDir, './file-service')
  }

  private prerequisites() {
    return fsExtra.ensureDir(this.folder)
  }

  /**
   * @see https://stackoverflow.com/a/45242825
   * @param targetFullPath {string}
   */
  judgeFilePathValid(targetFullPath: string) {
    const r = path.relative(this.folder, targetFullPath)

    return !!r && !r.startsWith('..') && !path.isAbsolute(r)
  }

  async get(filePathOrName: string) {
    await this.prerequisites()

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    if (!this.judgeFilePathValid(targetFullPath)) {
      return null
    }

    if (!fsExtra.pathExistsSync(targetFullPath)) {
      return false
    }

    return fsExtra.readFile(targetFullPath)
  }

  async set(filePathOrName: string, content: Buffer | string) {
    await this.prerequisites()

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    if (!this.judgeFilePathValid(targetFullPath)) {
      return false
    }

    return fsExtra
      .writeFile(targetFullPath, content, { encoding: 'utf-8' })
      .then(() => true)
      .catch(() => false)
  }

  async append(filePathOrName: string, content: Buffer | string, options?: Partial<{ useNewLineOnEOF: boolean }>) {
    await this.prerequisites()

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    if (!this.judgeFilePathValid(targetFullPath)) {
      return false
    }

    return fsExtra
      .appendFile(
        targetFullPath,
        _.get(options, 'useNewLineOnEOF')
          ? content.toString().replace(fileNewLineOnEOFPattern, '') + fileNewLineMark
          : content.toString(),
        { encoding: 'utf-8' }
      )
      .then(() => true)
      .catch(() => false)
  }

  async exists(filePathOrName: string, content?: Buffer | string) {
    await this.prerequisites()

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    const isTargetFullPathValid = this.judgeFilePathValid(targetFullPath)
    if (!isTargetFullPathValid) {
      return false
    }

    if (!fsExtra.pathExistsSync(targetFullPath)) {
      return false
    }

    if (content == undefined) {
      return isTargetFullPathValid
    }

    const rs = fsExtra.createReadStream(targetFullPath, { encoding: 'utf-8', highWaterMark: 128 })
    const { p, resolve } = shared.utils.generateOperablePromise<boolean>()
    rs.on('data', chunk => {
      if (chunk.toString().includes(content.toString())) {
        resolve(true)
        rs.close()
      }
    })

    rs.on('close', () => resolve(false))
    rs.on('error', () => resolve(false))
    rs.on('end', () => resolve(false))

    return p
  }

  async remove(
    filePathOrName: string,
    content?: Buffer | string,
    options?: Partial<{ useContentReplaceAllMode: boolean }>
  ) {
    await this.prerequisites()

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    const isTargetFullPathValid = this.judgeFilePathValid(targetFullPath)
    if (!isTargetFullPathValid) {
      return false
    }

    if (!fsExtra.pathExistsSync(targetFullPath)) {
      return false
    }

    if (content == undefined) {
      return fsExtra
        .unlink(targetFullPath)
        .then(() => true)
        .catch(() => false)
    }

    // Read & write.
    const fileContent = await fsExtra.readFile(targetFullPath, { encoding: 'utf-8' })

    const targetFileContent = _.get(options, 'useContentReplaceAllMode')
      ? fileContent.replace(content.toString(), '')
      : fileContent.replaceAll(content.toString(), '')

    if (fileContent === targetFileContent) {
      return true
    }

    return fsExtra
      .writeFile(targetFullPath, targetFileContent)
      .then(() => true)
      .catch(() => false)
  }

  async clear(filePathOrName?: string, options?: Partial<{ useEmptyContentMode: boolean }>) {
    await this.prerequisites()

    if (filePathOrName == undefined) {
      return fsExtra
        .emptyDir(this.folder)
        .then(() => true)
        .catch(() => false)
    }

    const targetFullPath = path.resolve(this.folder, filePathOrName)
    const isTargetFullPathValid = this.judgeFilePathValid(targetFullPath)
    if (!isTargetFullPathValid) {
      return false
    }

    if (!fsExtra.pathExistsSync(targetFullPath)) {
      return false
    }

    if (_.get(options, 'useEmptyContentMode')) {
      return fsExtra
        .writeFile(targetFullPath, '', { encoding: 'utf-8' })
        .then(() => true)
        .catch(() => false)
    }

    return fsExtra
      .unlink(targetFullPath)
      .then(() => true)
      .catch(() => false)
  }
}
