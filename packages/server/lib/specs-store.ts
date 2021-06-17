import Bluebird from 'bluebird'
import chokidar, { FSWatcher } from 'chokidar'
import _ from 'lodash'
import { findSpecsOfType } from './util/specs'

type SpecFile = Cypress.Cypress['spec']
type SpecFiles = SpecFile[]

interface SpecsWatcherOptions {
  onSpecsChanged: (specFiles: SpecFiles) => void
}

const COMMON_SEARCH_OPTIONS = ['fixturesFolder', 'supportFile', 'projectRoot', 'javascripts', 'testFiles', 'ignoreTestFiles']

// TODO: shouldn't this be on the trailing edge, not leading?
const debounce = (fn) => _.debounce(fn, 250, { leading: true })

type RunnerType = 'ct' | 'e2e'

export class SpecsStore {
  watcher: FSWatcher | null = null
  specFiles: SpecFiles = []

  constructor (
    private cypressConfig: Record<string, any>,
    private runner: RunnerType,
  ) {}

  get specDirectory () {
    if (this.runner === 'e2e') {
      return this.cypressConfig.resolved.integrationFolder.value
    }

    if (this.runner === 'ct') {
      return this.cypressConfig.resolved.componentFolder.value
    }
  }

  get testFiles () {
    return this.cypressConfig.resolved.testFiles.value
  }

  get watchOptions (): chokidar.WatchOptions {
    return {
      cwd: this.specDirectory,
      ignored: this.cypressConfig.ignoreTestFiles,
      ignoreInitial: true,
    }
  }

  storeSpecFiles (): Bluebird<void> {
    return this.getSpecFiles()
    .then((specFiles) => {
      console.log('LACHLAN: assign specFiles')
      this.specFiles = specFiles
    })
  }

  getSpecFiles (): Bluebird<SpecFiles> {
    console.log('LACHLAN: getting searchOptions')
    const searchOptions = _.pick(this.cypressConfig, COMMON_SEARCH_OPTIONS)
    console.log('LACHLAN: searchOptions', searchOptions)

    searchOptions.searchFolder = this.specDirectory
    console.log('LACHLAN: serachFolder', searchOptions.searchFolder)
    searchOptions.testFiles = this.testFiles
    console.log('LACHLAN: testFiles', searchOptions.testFiles)

    return findSpecsOfType(searchOptions)
  }

  watch (options?: SpecsWatcherOptions) {
    this.watcher = chokidar.watch(this.cypressConfig.testFiles, this.watchOptions)

    if (options?.onSpecsChanged) {
      const onSpecsChanged = debounce(async () => {
        const newSpecs = await this.getSpecFiles()

        if (_.isEqual(newSpecs, this.specFiles)) return

        this.specFiles = newSpecs

        options.onSpecsChanged(newSpecs)
      })

      this.watcher.on('add', onSpecsChanged)
      this.watcher.on('unlink', onSpecsChanged)
    }
  }

  reset (): void {
    this.watcher?.removeAllListeners()
  }
}
