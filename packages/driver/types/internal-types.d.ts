// NOTE: this is for internal Cypress types that we don't want exposed in the public API but want for development
// TODO: find a better place for this
/// <reference path="./cy/commands/session.d.ts" />
/// <reference path="./cy/logGroup.d.ts" />
/// <reference path="./cypress/log.d.ts" />
/// <reference path="./remote-state.d.ts" />

interface InternalWindowLoadDetails {
  type: 'same:origin' | 'cross:origin' | 'cross:origin:failure'
  error?: Error
  window?: AUTWindow
}

declare namespace Cypress {
  interface Actions {
    (action: 'internal:window:load', fn: (details: InternalWindowLoadDetails) => void)
    (action: 'net:stubbing:event', frame: any)
    (action: 'request:event', data: any)
    (action: 'backend:request', fn: (...any) => void)
    (action: 'automation:request', fn: (...any) => void)
    (action: 'viewport:changed', fn?: (viewport: { viewportWidth: string, viewportHeight: string }, callback: () => void) => void)
    (action: 'before:screenshot', fn: (config: {}, fn: () => void) => void)
    (action: 'after:screenshot', config: {})
  }

  interface Backend {
    (task: 'cross:origin:release:html'): boolean
    (task: 'cross:origin:bridge:ready', args: { originPolicy?: string }): boolean
    (task: 'cross:origin:finished', originPolicy: string): boolean
  }

  interface cy {
    /**
     * If `as` is chained to the current command, return the alias name used.
     */
    getNextAlias: IAliases['getNextAlias']
    noop: <T>(v: T) => Cypress.Chainable<T>
    queue: CommandQueue
    retry: IRetries['retry']
    state: State
    pauseTimers: ITimer['pauseTimers']
    // TODO: this function refers to clearTimeout at cy/timeouts.ts, which doesn't have any argument.
    // But in many cases like cy/commands/screenshot.ts, it's called with a timeout id string.
    // We should decide whether calling with id is correct or not.
    clearTimeout: ITimeouts['clearTimeout']
    isStable: IStability['isStable']
    isAnticipatingCrossOriginResponseFor: IStability['isAnticipatingCrossOriginResponseFor']
    fail: (err: Error, options:{ async?: boolean }) => Error
    getRemoteLocation: ILocation['getRemoteLocation']
    createSnapshot:  ISnapshots['createSnapshot']
    getStyles: ISnapshots['getStyles']
  }

  interface Cypress {
    backend: (eventName: string, ...args: any[]) => Promise<any>
    // TODO: how to pull this from proxy-logging.ts? can't import in a d.ts file...
    ProxyLogging: any
    // TODO: how to pull these from resolvers.ts? can't import in a d.ts file...
    resolveWindowReference: any
    resolveLocationReference: any
    routes: {
      [routeId: string]: any
    }
    sinon: sinon.SinonApi
    utils: CypressUtils
    state: State
    events: Events
    emit: (event: string, payload?: any) => void
    primaryOriginCommunicator: import('../src/cross-origin/communicator').PrimaryOriginCommunicator
    specBridgeCommunicator: import('../src/cross-origin/communicator').SpecBridgeCommunicator
    mocha: $Mocha
    configure: (config: Cypress.ObjectLike) => void
    isCrossOriginSpecBridge: boolean
    originalConfig: Cypress.ObjectLike
  }

  interface CypressUtils {
    throwErrByPath: (path: string, obj?: { args: object }) => void
    warnByPath: (path: string, obj?: { args: object }) => void
    warning: (message: string) => void
  }

  interface InternalConfig {
    (k: keyof ResolvedConfigOptions, v?: any): any
  }

  interface ResolvedConfigOptions {
    $autIframe: JQuery<HTMLIFrameElement>
    document: Document
    projectRoot?: string
  }
}

type AliasedRequest = {
  alias: string
  request: any
}

// utility types
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

interface SpecWindow extends Window {
  cy: $Cy
}

interface CypressRunnable extends Mocha.Runnable {
  type: null | 'hook' | 'suite' | 'test'
  hookId: any
  id: any
  err: any
}
