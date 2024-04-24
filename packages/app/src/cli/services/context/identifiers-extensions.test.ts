/* eslint-disable @shopify/prefer-module-scope-constants */
import {automaticMatchmaking} from './id-matching.js'
import {
  deployConfirmed,
  ensureExtensionsIds,
  ensureNonUuidManagedExtensionsIds,
  shiftRegistrationsAround,
} from './identifiers-extensions.js'
import {extensionMigrationPrompt, matchConfirmationPrompt} from './prompts.js'
import {manualMatchIds} from './id-manual-matching.js'
import {EnsureDeploymentIdsPresenceOptions, LocalSource, RemoteSource} from './identifiers.js'
import {AppInterface} from '../../models/app/app.js'
import {
  testApp,
  testAppConfigExtensions,
  testFunctionExtension,
  testOrganizationApp,
  testUIExtension,
  testPaymentsAppExtension,
  testDeveloperPlatformClient,
  testWebhookSubscriptionExtensions,
} from '../../models/app/app.test-data.js'
import {getUIExtensionsToMigrate, migrateExtensionsToUIExtension} from '../dev/migrate-to-ui-extension.js'
import {OrganizationApp} from '../../models/organization.js'
import {ExtensionInstance} from '../../models/extensions/extension-instance.js'
import {DeveloperPlatformClient} from '../../utilities/developer-platform-client.js'
import {ExtensionCreateSchema} from '../../api/graphql/extension_create.js'
import {beforeEach, describe, expect, vi, test, beforeAll} from 'vitest'
import {AbortSilentError} from '@shopify/cli-kit/node/error'
import {setPathValue} from '@shopify/cli-kit/common/object'
import appPOSSpec from '../../models/extensions/specifications/app_config_point_of_sale.js'
import {WebhookSubscriptionSchema} from '../../models/extensions/specifications/app_config_webhook_schemas/webhook_subscription_schema.js'
import appWebhookSubscriptionSpec from '../../models/extensions/specifications/app_config_webhook_subscription.js'
import {config} from 'process'

interface Registration {
  uuid: string
  id: string
  title: string
  type: string
  contextValue?: string
}

const REGISTRATION_A = {
  uuid: 'UUID_A',
  id: 'A',
  title: 'A',
  type: 'CHECKOUT_POST_PURCHASE',
  contextValue: '',
}

const REGISTRATION_A_2 = {
  uuid: 'UUID_A_2',
  id: 'A_2',
  title: 'A_2',
  type: 'CHECKOUT_POST_PURCHASE',
  contextValue: '',
}

const REGISTRATION_A_3 = {
  uuid: 'UUID_A_3',
  id: 'A_3',
  title: 'A_3',
  type: 'CHECKOUT_POST_PURCHASE',
  contextValue: '',
}

const REGISTRATION_B = {
  uuid: 'UUID_B',
  id: 'B',
  title: 'B',
  type: 'SUBSCRIPTION_MANAGEMENT',
  contextValue: '',
}

const FUNCTION_REGISTRATION_A = {
  uuid: 'FUNCTION_A_UUID',
  id: 'FUNCTION_A',
  title: 'FUNCTION_A',
  type: 'FUNCTION',
  contextValue: '',
}

const PAYMENTS_REGISTRATION_A = {
  uuid: 'PAYMENTS_A_UUID',
  id: 'PAYMENTS_A',
  title: 'PAYMENTS_A',
  type: 'PAYMENTS',
  contextValue: 'payments.offsite.render',
}

let EXTENSION_A: ExtensionInstance
let EXTENSION_A_2: ExtensionInstance
let EXTENSION_B: ExtensionInstance
let FUNCTION_A: ExtensionInstance
let PAYMENTS_A: ExtensionInstance

const LOCAL_APP = (
  uiExtensions: ExtensionInstance[],
  functionExtensions: ExtensionInstance[] = [],
  includeDeployConfig = false,
  configExtensions: ExtensionInstance[] = [],
): AppInterface => {
  return testApp({
    name: 'my-app',
    directory: '/app',
    configuration: {
      path: '/shopify.app.toml',
      scopes: 'read_products',
      extension_directories: ['extensions/*'],
      ...(includeDeployConfig ? {build: {include_config_on_deploy: true}} : {}),
    },
    allExtensions: [...uiExtensions, ...functionExtensions, ...configExtensions],
  })
}

const options = (
  uiExtensions: ExtensionInstance[],
  functionExtensions: ExtensionInstance[] = [],
  options: {
    identifiers?: any
    remoteApp?: OrganizationApp
    release?: boolean
    includeDeployConfig?: boolean
    configExtensions?: ExtensionInstance[]
    flags?: string[]
    developerPlatformClient?: DeveloperPlatformClient
  } = {},
): EnsureDeploymentIdsPresenceOptions => {
  const {
    identifiers = {},
    remoteApp = testOrganizationApp(),
    release = true,
    includeDeployConfig = false,
    configExtensions = [],
    flags = [],
    developerPlatformClient = testDeveloperPlatformClient(),
  } = options
  const localApp = {
    app: LOCAL_APP(uiExtensions, functionExtensions, includeDeployConfig, configExtensions),
    developerPlatformClient,
    appId: 'appId',
    appName: 'appName',
    envIdentifiers: {extensions: identifiers},
    force: false,
    remoteApp,
    release,
  }
  setPathValue(localApp.app, 'remoteFlags', flags)
  return localApp
}

async function createExtensionResult(registration: Registration): Promise<ExtensionCreateSchema> {
  return {
    extensionCreate: {
      extensionRegistration: {
        ...registration,
        draftVersion: {
          config: 'config',
          registrationId: 'registrationId',
          lastUserInteractionAt: '2024-01-01',
          validationErrors: [],
        },
      },
      userErrors: [],
    },
  }
}

vi.mock('@shopify/cli-kit/node/session')

vi.mock('./prompts', async () => {
  const prompts: any = await vi.importActual('./prompts')
  return {
    ...prompts,
    matchConfirmationPrompt: vi.fn(),
    deployConfirmationPrompt: vi.fn(),
    extensionMigrationPrompt: vi.fn(),
  }
})
vi.mock('./id-matching')
vi.mock('./id-manual-matching')
vi.mock('../dev/migrate-to-ui-extension')

beforeAll(async () => {
  EXTENSION_A = await testUIExtension({
    directory: 'EXTENSION_A',
    type: 'checkout_post_purchase',
    configuration: {
      name: 'EXTENSION A',
      type: 'checkout_post_purchase',
      metafields: [],
      capabilities: {
        network_access: false,
        block_progress: false,
        api_access: false,
        collect_buyer_consent: {
          sms_marketing: false,
          customer_privacy: false,
        },
      },
    },
    entrySourceFilePath: '',
  })

  EXTENSION_A_2 = await testUIExtension({
    directory: 'EXTENSION_A_2',
    type: 'checkout_post_purchase',
    configuration: {
      name: 'EXTENSION A 2',
      type: 'checkout_post_purchase',
      metafields: [],
      capabilities: {
        network_access: false,
        block_progress: false,
        api_access: false,
        collect_buyer_consent: {
          sms_marketing: false,
          customer_privacy: false,
        },
      },
    },
    entrySourceFilePath: '',
    devUUID: 'devUUID',
  })

  EXTENSION_B = await testUIExtension({
    directory: 'EXTENSION_B',
    type: 'checkout_post_purchase',
    configuration: {
      name: 'EXTENSION_B',
      type: 'checkout_post_purchase',
      metafields: [],
      capabilities: {
        network_access: false,
        block_progress: false,
        api_access: false,
        collect_buyer_consent: {
          sms_marketing: false,
          customer_privacy: false,
        },
      },
    },
    entrySourceFilePath: '',
    devUUID: 'devUUID',
  })

  FUNCTION_A = await testFunctionExtension({
    dir: '/function',
    config: {
      name: 'FUNCTION A',
      type: 'product_discounts',
      description: 'Function',
      build: {
        command: 'make build',
        path: 'dist/index.wasm',
      },
      metafields: [],
      configuration_ui: false,
      api_version: '2022-07',
    },
  })

  PAYMENTS_A = await testPaymentsAppExtension({
    dir: '/payments',
    config: {
      name: 'Payments Extension',
      type: 'payments_extension',
      description: 'Payments App Extension',
      metafields: [],
      api_version: '2022-07',
      payment_session_url: 'https://example.com/payment',
      supported_countries: ['US'],
      supported_payment_methods: ['VISA'],
      test_mode_available: true,
      merchant_label: 'Merchant Label',
      supports_installments: false,
      supports_deferred_payments: false,
      supports_3ds: false,
      targeting: [{target: 'payments.offsite.render'}],
    },
  })
})

beforeEach(() => {
  vi.mocked(getUIExtensionsToMigrate).mockReturnValue([])
})

describe('matchmaking returns more remote sources than local', () => {
  test('ensureExtensionsIds', async () => {
    // Given
    vi.mocked(matchConfirmationPrompt).mockResolvedValueOnce(true)
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [REGISTRATION_B],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A]), {
      extensionRegistrations: [REGISTRATION_A, REGISTRATION_B],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [],
      validMatches: {
        EXTENSION_A: 'UUID_A',
      },
    })
  })
  test('deployConfirmed', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {
      EXTENSION_A: 'UUID_A',
    }
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_B]

    // When
    const got = await deployConfirmed(options([EXTENSION_A]), remoteExtensions, [], {extensionsToCreate, validMatches})

    // Then
    expect(got).toEqual({
      extensions: {
        EXTENSION_A: 'UUID_A',
      },
      extensionIds: {EXTENSION_A: 'A'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with pending manual matches', () => {
  test('ensureExtensionsIds: will call manualMatch and merge automatic and manual matches and create missing extensions', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [EXTENSION_A, EXTENSION_A_2, EXTENSION_B],
        remote: [REGISTRATION_A, REGISTRATION_A_2],
      },
    })

    vi.mocked(manualMatchIds).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
      toCreate: [EXTENSION_B],
      onlyRemote: [],
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A, EXTENSION_A_2]), {
      extensionRegistrations: [REGISTRATION_A, REGISTRATION_A_2],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(manualMatchIds).toHaveBeenCalledWith(
      {local: [EXTENSION_A, EXTENSION_A_2, EXTENSION_B], remote: [REGISTRATION_A, REGISTRATION_A_2]},
      'uuid',
    )
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [EXTENSION_B],
      validMatches: {
        EXTENSION_A: 'UUID_A',
        EXTENSION_A_2: 'UUID_A_2',
      },
    })
  })

  test('deployConfirmed: create missing extensions', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = [EXTENSION_B]
    const validMatches = {
      EXTENSION_A: 'UUID_A',
      EXTENSION_A_2: 'UUID_A_2',
    }
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_A_2]
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: () => createExtensionResult(REGISTRATION_B),
    })

    // When
    const got = await deployConfirmed(
      options([EXTENSION_A, EXTENSION_A_2], [], {developerPlatformClient}),
      remoteExtensions,
      [],
      {
        extensionsToCreate,
        validMatches,
      },
    )

    // Then
    expect(got).toEqual({
      extensions: {
        EXTENSION_A: 'UUID_A',
        EXTENSION_A_2: 'UUID_A_2',
        'extension-b': 'UUID_B',
      },
      extensionIds: {EXTENSION_A: 'A', EXTENSION_A_2: 'A_2', 'extension-b': 'B'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with pending manual matches and manual match fails', () => {
  test('ensureExtensionsIds', async () => {
    // Given
    vi.mocked(matchConfirmationPrompt).mockResolvedValueOnce(true)
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [EXTENSION_A, EXTENSION_A_2],
        remote: [REGISTRATION_A, REGISTRATION_A_2],
      },
    })
    vi.mocked(manualMatchIds).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A'},
      toCreate: [EXTENSION_A_2],
      onlyRemote: [REGISTRATION_A_2],
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A, EXTENSION_A_2]), {
      extensionRegistrations: [REGISTRATION_A, REGISTRATION_A_2],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [EXTENSION_A_2],
      validMatches: {
        EXTENSION_A: 'UUID_A',
      },
    })
    expect(manualMatchIds).toBeCalledWith(
      {local: [EXTENSION_A, EXTENSION_A_2], remote: [REGISTRATION_A, REGISTRATION_A_2]},
      'uuid',
    )
  })
  test('deployConfirmed', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = [EXTENSION_A_2]
    const validMatches = {
      EXTENSION_A: 'UUID_A',
    }
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_A_2]
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: () => createExtensionResult(REGISTRATION_A_3),
    })

    // When
    const got = await deployConfirmed(
      options([EXTENSION_A, EXTENSION_A_2], [], {developerPlatformClient}),
      remoteExtensions,
      [],
      {
        extensionsToCreate,
        validMatches,
      },
    )

    // Then
    expect(got).toEqual({
      extensions: {
        EXTENSION_A: 'UUID_A',
        'extension-a-2': 'UUID_A_3',
      },
      extensionIds: {EXTENSION_A: 'A', 'extension-a-2': 'A_3'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with pending some pending to create', () => {
  test('ensureExtensionsIds', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {},
      toConfirm: [],
      toCreate: [EXTENSION_A, EXTENSION_A_2],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A, EXTENSION_A_2]), {
      extensionRegistrations: [REGISTRATION_A, REGISTRATION_A_2],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [EXTENSION_A, EXTENSION_A_2],
      validMatches: {},
    })
  })
  test('deployConfirmed: Create the pending extensions and succeeds', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = [EXTENSION_A, EXTENSION_A_2]
    const validMatches = {}
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_A_2]
    let createExtensionCounter = 0
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: async () => {
        createExtensionCounter++
        if (createExtensionCounter === 1) {
          return createExtensionResult(REGISTRATION_A)
        } else if (createExtensionCounter === 2) {
          return createExtensionResult(REGISTRATION_A_2)
        } else {
          throw new Error('createExtension should not be called 3 times')
        }
      },
    })

    // When
    const got = await deployConfirmed(
      options([EXTENSION_A, EXTENSION_A_2], [], {developerPlatformClient}),
      remoteExtensions,
      [],
      {
        extensionsToCreate,
        validMatches,
      },
    )

    // Then
    expect(developerPlatformClient.createExtension).toBeCalledTimes(2)
    expect(got).toEqual({
      extensions: {'extension-a': 'UUID_A', 'extension-a-2': 'UUID_A_2'},
      extensionIds: {'extension-a': 'A', 'extension-a-2': 'A_2'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with some pending confirmation', () => {
  test('ensureExtensionsIds: confirms the pending ones and succeeds', async () => {
    // Given
    vi.mocked(matchConfirmationPrompt).mockResolvedValueOnce(true)
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {},
      toConfirm: [{local: EXTENSION_B, remote: REGISTRATION_B}],
      toCreate: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_B]), {
      extensionRegistrations: [REGISTRATION_B],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [],
      validMatches: {
        'extension-b': 'UUID_B',
      },
    })
  })
  test('deployConfirmed', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {'extension-b': 'UUID_B'}
    const remoteExtensions = [REGISTRATION_B]
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const got = await deployConfirmed(options([EXTENSION_B], [], {developerPlatformClient}), remoteExtensions, [], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).not.toBeCalled()
    expect(got).toEqual({
      extensions: {'extension-b': 'UUID_B'},
      extensionIds: {'extension-b': 'B'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with some pending confirmation', () => {
  test('ensureExtensionsIds: does not confirm the pending ones', async () => {
    // Given
    vi.mocked(matchConfirmationPrompt).mockResolvedValueOnce(false)
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {},
      toConfirm: [{local: EXTENSION_B, remote: REGISTRATION_B}],
      toCreate: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_B]), {
      extensionRegistrations: [REGISTRATION_B],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [EXTENSION_B],
      validMatches: {},
    })
  })
  test('deployConfirmed: creates non confirmed as new extensions', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = [EXTENSION_B]
    const validMatches = {}
    const remoteExtensions = [REGISTRATION_B]
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: () => createExtensionResult(REGISTRATION_B),
    })

    // When
    const got = await deployConfirmed(options([EXTENSION_B], [], {developerPlatformClient}), remoteExtensions, [], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).toBeCalledTimes(1)
    expect(got).toEqual({
      extensions: {'extension-b': 'UUID_B'},
      extensionIds: {'extension-b': 'B'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('matchmaking returns ok with nothing pending', () => {
  test('ensureExtensionsIds: succeeds and returns all identifiers', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A, EXTENSION_A_2]), {
      extensionRegistrations: [REGISTRATION_A, REGISTRATION_A_2],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [],
      validMatches: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
    })
  })
  test('deployConfirmed: does not create any extension', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'}
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_A_2]
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const got = await deployConfirmed(
      options([EXTENSION_A, EXTENSION_A_2], [], {developerPlatformClient}),
      remoteExtensions,
      [],
      {
        extensionsToCreate,
        validMatches,
      },
    )

    // Then
    expect(developerPlatformClient.createExtension).not.toBeCalled()
    expect(got).toEqual({
      extensions: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
      extensionIds: {EXTENSION_A: 'A', EXTENSION_A_2: 'A_2'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('includes functions', () => {
  test('ensureExtensionsIds: succeeds and returns all identifiers', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', FUNCTION_A: 'FUNCTION_A_UUID'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const got = await ensureExtensionsIds(options([EXTENSION_A], [FUNCTION_A]), {
      extensionRegistrations: [REGISTRATION_A, FUNCTION_REGISTRATION_A],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(automaticMatchmaking).toHaveBeenCalledWith(
      [EXTENSION_A, FUNCTION_A],
      [REGISTRATION_A, FUNCTION_REGISTRATION_A],
      {},
      'uuid',
    )
    expect(got).toEqual({
      dashboardOnlyExtensions: [],
      extensionsToCreate: [],
      validMatches: {EXTENSION_A: 'UUID_A', FUNCTION_A: 'FUNCTION_A_UUID'},
    })
  })
  test('deployConfirmed: does not create any extension', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {EXTENSION_A: 'UUID_A', FUNCTION_A: 'FUNCTION_A_UUID'}
    const remoteExtensions = [REGISTRATION_A, FUNCTION_REGISTRATION_A]
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const got = await deployConfirmed(
      options([EXTENSION_A], [FUNCTION_A], {developerPlatformClient}),
      remoteExtensions,
      [],
      {
        extensionsToCreate,
        validMatches,
      },
    )

    // Then
    expect(developerPlatformClient.createExtension).not.toBeCalled()
    expect(got).toEqual({
      extensions: {EXTENSION_A: 'UUID_A', FUNCTION_A: 'FUNCTION_A_UUID'},
      extensionIds: {EXTENSION_A: 'A', FUNCTION_A: 'FUNCTION_A'},
      extensionsNonUuidManaged: {},
    })
  })
})

describe('excludes non uuid managed extensions', () => {
  test("ensureExtensionsIds: automatic matching logic doesn't receive the non uuid managed extensions", async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', FUNCTION_A: 'FUNCTION_A_UUID'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })

    // When
    const CONFIG_A = await testAppConfigExtensions()
    const ensureExtensionsIdsOptions = options([EXTENSION_A], [], {configExtensions: [CONFIG_A]})
    await ensureExtensionsIds(ensureExtensionsIdsOptions, {
      extensionRegistrations: [REGISTRATION_A],
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(automaticMatchmaking).toHaveBeenCalledWith([EXTENSION_A], [REGISTRATION_A], {}, 'uuid')
  })
})

describe('ensureExtensionsIds: Migrates extension', () => {
  test('shows confirmation prompt', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })
    const extensionsToMigrate = [
      {local: EXTENSION_A, remote: REGISTRATION_A},
      {local: EXTENSION_A_2, remote: REGISTRATION_A_2},
    ]
    vi.mocked(getUIExtensionsToMigrate).mockReturnValueOnce(extensionsToMigrate)

    // When / Then
    await expect(() =>
      ensureExtensionsIds(options([EXTENSION_A, EXTENSION_A_2]), {
        extensionRegistrations: [REGISTRATION_A, REGISTRATION_A_2],
        dashboardManagedExtensionRegistrations: [],
      }),
    ).rejects.toThrowError(AbortSilentError)

    expect(extensionMigrationPrompt).toBeCalledWith(extensionsToMigrate)
  })

  test('migrates extensions', async () => {
    // Given
    vi.mocked(automaticMatchmaking).mockResolvedValueOnce({
      identifiers: {EXTENSION_A: 'UUID_A', EXTENSION_A_2: 'UUID_A_2'},
      toCreate: [],
      toConfirm: [],
      toManualMatch: {
        local: [],
        remote: [],
      },
    })
    const extensionsToMigrate = [
      {local: EXTENSION_A, remote: REGISTRATION_A},
      {local: EXTENSION_A_2, remote: REGISTRATION_A_2},
    ]
    vi.mocked(getUIExtensionsToMigrate).mockReturnValueOnce(extensionsToMigrate)
    vi.mocked(extensionMigrationPrompt).mockResolvedValueOnce(true)
    const opts = options([EXTENSION_A, EXTENSION_A_2])
    const remoteExtensions = [REGISTRATION_A, REGISTRATION_A_2]

    // When
    await ensureExtensionsIds(opts, {
      extensionRegistrations: remoteExtensions,
      dashboardManagedExtensionRegistrations: [],
    })

    // Then
    expect(migrateExtensionsToUIExtension).toBeCalledWith(
      extensionsToMigrate,
      opts.appId,
      remoteExtensions,
      opts.developerPlatformClient,
    )
  })
})

describe('deployConfirmed: handle non existent uuid managed extensions', () => {
  test('when include config on deploy flag is enabled configuration extensions are created', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {}
    const REGISTRATION_CONFIG_A = {
      uuid: 'UUID_C_A',
      id: 'C_A',
      title: 'C_A',
      type: 'POINT_OF_SALE',
    }
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const CONFIG_A = await testAppConfigExtensions()
    const ensureExtensionsIdsOptions = options([], [], {
      includeDeployConfig: true,
      configExtensions: [CONFIG_A],
      developerPlatformClient,
    })
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [REGISTRATION_CONFIG_A], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).not.toBeCalled()
    expect(got).toEqual({
      extensions: {},
      extensionIds: {'point-of-sale': 'C_A'},
      extensionsNonUuidManaged: {'point-of-sale': ['UUID_C_A']},
    })
  })
  test('when the include config on deploy flag is disabled configuration extensions are not created', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {}
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const CONFIG_A = await testAppConfigExtensions()
    const ensureExtensionsIdsOptions = options([], [], {configExtensions: [CONFIG_A], developerPlatformClient})
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).not.toHaveBeenCalled()
    expect(got).toEqual({
      extensions: {},
      extensionIds: {},
      extensionsNonUuidManaged: {},
    })
  })
  test('when the include config on deploy flag is disabled but draft extensions should be used configuration extensions are created', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {}
    const REGISTRATION_CONFIG_A = {
      uuid: 'UUID_C_A',
      id: 'C_A',
      title: 'C_A',
      type: 'POINT_OF_SALE',
    }
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: () => createExtensionResult(REGISTRATION_CONFIG_A),
    })

    // When

    const CONFIG_A = await testAppConfigExtensions()
    const ensureExtensionsIdsOptions = options([], [], {configExtensions: [CONFIG_A], developerPlatformClient})
    ensureExtensionsIdsOptions.includeDraftExtensions = true
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).toBeCalledTimes(1)
    expect(got).toEqual({
      extensions: {},
      extensionIds: {'point-of-sale': 'C_A'},
      extensionsNonUuidManaged: {'point-of-sale': ['UUID_C_A']},
    })
  })
  test('when the include config on deploy flag is disabled but draft extensions should be used configuration extensions are created with context', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = [PAYMENTS_A]
    const validMatches = {}
    const developerPlatformClient = testDeveloperPlatformClient({
      createExtension: () => createExtensionResult(PAYMENTS_REGISTRATION_A),
    })

    // When
    const ensureExtensionsIdsOptions = options([], [], {configExtensions: [PAYMENTS_A], developerPlatformClient})
    ensureExtensionsIdsOptions.includeDraftExtensions = true
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).toHaveBeenCalledWith({
      apiKey: 'appId',
      type: PAYMENTS_A.graphQLType,
      config: '{}',
      handle: PAYMENTS_A.handle,
      title: PAYMENTS_A.handle,
      context: 'payments.offsite.render',
    })
    expect(got).toEqual({
      extensions: {'payments-extension': 'PAYMENTS_A_UUID'},
      extensionIds: {'payments-extension': 'PAYMENTS_A'},
      extensionsNonUuidManaged: {},
    })
  })
})
describe('deployConfirmed: handle existent uuid managed extensions', () => {
  test('when the include config on deploy flag is enabled configuration extensions are not created but the uuids are returned', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {}
    const REGISTRATION_CONFIG_A = {
      uuid: 'UUID_C_A',
      id: 'C_A',
      title: 'C_A',
      type: 'POINT_OF_SALE',
    }
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const CONFIG_A = await testAppConfigExtensions()

    const ensureExtensionsIdsOptions = options([], [], {
      includeDeployConfig: true,
      configExtensions: [CONFIG_A],
      developerPlatformClient,
    })
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [REGISTRATION_CONFIG_A], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).not.toHaveBeenCalled()
    expect(got).toEqual({
      extensions: {},
      extensionIds: {'point-of-sale': 'C_A'},
      extensionsNonUuidManaged: {'point-of-sale': ['UUID_C_A']},
    })
  })
})

// karen.xie: maybe organize these tests a bit better
describe('deployConfirmed: extensions that should be managed in the TOML', () => {
  test('are also passed to the `ensureNonUuidManagedExtensionsIds` function', async () => {
    // Given
    const extensionsToCreate: LocalSource[] = []
    const validMatches = {}
    const REGISTRATION_CONFIG_A = {
      uuid: 'UUID_C_A',
      id: 'C_A',
      title: 'C_A',
      type: 'POINT_OF_SALE',
    }
    const developerPlatformClient = testDeveloperPlatformClient()

    // When
    const CONFIG_A = await testAppConfigExtensions()

    const ensureExtensionsIdsOptions = options([], [], {
      includeDeployConfig: true,
      configExtensions: [CONFIG_A],
      developerPlatformClient,
    })
    const got = await deployConfirmed(ensureExtensionsIdsOptions, [], [REGISTRATION_CONFIG_A], {
      extensionsToCreate,
      validMatches,
    })

    // Then
    expect(developerPlatformClient.createExtension).not.toHaveBeenCalled()
    expect(got).toEqual({
      extensions: {},
      extensionIds: {'point-of-sale': 'C_A'},
      extensionsNonUuidManaged: {'point-of-sale': ['UUID_C_A']},
    })
  })
})

describe('shiftRegistrationsAround', () => {
  test('extension registrations that are managed in the TOML should be returned in the same array as configuration registrations', () => {
    // Given
    const extensionManagedInToml =
      {
        uuid: 'webhook-subscription-uuid',
        id: 'webhook-subscription-id',
        title: 'Webhook Subscription',
        type: 'WEBHOOK_SUBSCRIPTION',
      }

    const extensionRegistrations = [REGISTRATION_B, extensionManagedInToml]
    const configurationRegistrations = [
      {
        uuid: 'UUID_C_A',
        id: 'C_A',
        title: 'C_A',
        type: 'POINT_OF_SALE',
      }
    ]
    const specifications = [
      appPOSSpec,
      appWebhookSubscriptionSpec
    ]

    // karen.xie add expectation that `extensionManagedInToml` has a spec that is managed in toml and has experience extension

    // Then
    const {extensionsNotManagedInConfig, allRegistrationsManagedInConfig} = shiftRegistrationsAround(extensionRegistrations, configurationRegistrations, specifications)

    expect(extensionsNotManagedInConfig).toEqual([
      REGISTRATION_B
    ])
    expect(allRegistrationsManagedInConfig).toEqual([configurationRegistrations[0], extensionManagedInToml])
  })
})

describe('ensureNonUuidManagedExtensionsIds: for extensions managed in the TOML', () => {
  test('creates the extension if no possible matches', async () => {
    // Given
    const remoteSources: RemoteSource[] = []
    const app = options([await testWebhookSubscriptionExtensions()], [], {includeDeployConfig: true}).app
    const appId = 'appId'
    const developerPlatformClient = testDeveloperPlatformClient()

    // Then
    // karen.xie: expect that `createExtension` is called
    // and that the behaviour in `buildExtensionsInGlobalToCreate` is as expected

    const {extensionsNonUuidManaged, extensionsIdsNonUuidManaged} = await ensureNonUuidManagedExtensionsIds(remoteSources, app, appId, false, developerPlatformClient)

    expect(developerPlatformClient.createExtension).toBeCalledTimes(4)

    // karen.xie: `createExtension` is stubbed in `app.test-data.ts` to always return the same response
    // which is why we have 4 of the same extension UUID
    // see above for an example of how to have the developerPlatformClient return different values
    expect(extensionsNonUuidManaged).toEqual({'webhook-subscription': ['extension-uuid', 'extension-uuid', 'extension-uuid', 'extension-uuid']})
    expect(extensionsIdsNonUuidManaged).toEqual({'webhook-subscription': ['extension-id', 'extension-id', 'extension-id', 'extension-id']})
  })

  test('if there are possible matches, creates the extension for those that dont match', async () => {
    // Given
    const extensionManagedInToml =
      {
        uuid: 'webhook-subscription-uuid',
        id: 'webhook-subscription-id',
        title: 'Webhook Subscription',
        type: 'WEBHOOK_SUBSCRIPTION',
        activeVersion: {
          config: JSON.stringify({
            api_version: '2024-01',
            topic: 'orders/delete',
            uri: "https://my-app.com/webhooks"
          })
        }
      }

    const remoteSources = [extensionManagedInToml]
    const app = options([await testWebhookSubscriptionExtensions()], [], {includeDeployConfig: true}).app
    const appId = 'appId'
    const developerPlatformClient = testDeveloperPlatformClient()

    // Then
    const {extensionsNonUuidManaged, extensionsIdsNonUuidManaged} = await ensureNonUuidManagedExtensionsIds(remoteSources, app, appId, false, developerPlatformClient)

    expect(developerPlatformClient.createExtension).toBeCalledTimes(3)

    // karen.xie: `createExtension` is stubbed in `app.test-data.ts` to always return the same response
    // which is why we have 4 of the same extension UUID
    // see above for an example of how to have the developerPlatformClient return different values
    expect(extensionsNonUuidManaged).toEqual({'webhook-subscription': ['webhook-subscription-uuid', 'extension-uuid', 'extension-uuid', 'extension-uuid']})
    expect(extensionsIdsNonUuidManaged).toEqual({'webhook-subscription': ['webhook-subscription-id', 'extension-id', 'extension-id', 'extension-id']})
  })
})
/* karen.xie: add tests for
     - there are two functions at the end of the file that need to be tested - should they be pulled out and tested separately?
*/
