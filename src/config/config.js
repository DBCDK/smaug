const config = {
  ports: {
    oAuth: process.env.PORT_OAUTH || process.env.PORT,
    admin: process.env.PORT_ADMIN,
    configuration:
      process.env.PORT_CONFIG || process.env.PORT_OAUTH || process.env.PORT
  },
  culr: {
    uri: process.env.CULR_URI,
    userIdAut: process.env.CULR_USER_ID_AUT,
    groupIdAut: process.env.CULR_GROUP_ID_AUT,
    passwordAut: process.env.CULR_PASSWORD_AUT
  },
  mock_externals: {
    culr: process.env.MOCK_CULR || 0,
    db: process.env.MOCK_DB || 0
  },
  datasources: {
    postgres: {
      uri: process.env.DATABASE_URI
    },
    redis: {
      uri: process.env.REDIS
    },
    inmemory: {}
  },
  admin: {
    users: JSON.parse(process.env.ADMIN_USERS)
  },

  storePasswordsInRedis: {
    uri: process.env.REDIS,
    prefix: 'user:'
  },
  defaultLibraryId: process.env.DEFAULT_LIBRARY_ID,
  userstore: {
    backend: 'borchk',
    config: {
      wsdl: process.env.BORCHK_WSDL,
      serviceRequester: process.env.SERVICE_REQUESTER
    }
  },
  auth: {
    default: {
      backend: 'borchk',
      config: {
        wsdl: process.env.BORCHK_WSDL,
        serviceRequester: process.env.SERVICE_REQUESTER
      }
    },
    test: {
      backend: 'inmemory',
      config: {
        users: {
          'donald@test': 'duck'
        }
      }
    },
    allowAll: {
      backend: 'allow-all',
      config: {}
    }
  },
  agencystore: {
    backend: 'inmemory',
    config: {
      agencies: {
        '190101': {
          search: {
            profile: 'default'
          }
        }
      }
    }
  },
  clientstore: {
    backend: 'postgres',
    config: {}
  },
  tokenstore: {
    backend: 'postgres',
    config: {}
  },
  configstore: {
    backend: 'dbc',
    config: {
      default: {
        services: {
          cicero: 'https://cicero-fbs.com/rest/external/v1/',
          ddbcmsapi: 'https://cmscontent.dbc.dk/',
          moreinfo: 'https://moreinfo.addi.dk/2.11/',
          openagency: 'https://openagency.addi.dk/2.34/',
          openholdingstatus: 'https://openholdingstatus.addi.dk/3.0/',
          openorder: 'https://openorder.addi.dk/2.8/',
          opensearch: 'https://opensearch.addi.dk/b3.5_5.0/',
          openuserstatus: 'https://openuserstatus.addi.dk/1.6.1/',
          rank: 'https://xptest.dbc.dk/ms/rank/v1',
          suggestpopular: 'http://xptest.dbc.dk/ms/entity-pop/v1',
          suggestcreator: 'http://xptest.dbc.dk/ms/entity-suggest/v1/creator',
          suggestlibrary: 'http://xptest.dbc.dk/ms/entity-suggest/v1/library',
          suggestsubject: 'http://xptest.dbc.dk/ms/entity-suggest/v1/subject',
          suggest: 'http://ortograf.mcp1-proxy.dbc.dk/ortograf/',
          recommend: 'http://recomole.mcp1-proxy.dbc.dk/recomole/loan-cosim',
          performance: 'https://elk-p01.dbc.dk:9100/prod_ux-*/',
          recommendurls: {
            default: 'https://xptest.dbc.dk/ms/recommend-cosim/v1',
            popular: 'https://xptest.dbc.dk/ms/recommend-pop/v1'
          }
        },
        cicero: {},
        performance: {
          password: process.env.CONFIG_PERFORMANCE_PASSWORD,
          username: process.env.CONFIG_PERFORMANCE_USERNAME
        },
        user: {
          salt: process.env.CONFIG_USER_SALT
        },
        netpunkt: {
          user: process.env.CONFIG_NETPUNKT_USER,
          group: process.env.CONFIG_NETPUNKT_GROUP,
          password: process.env.CONFIG_NETPUNKT_PASSWORD
        },
        search: {
          profile: 'opac'
        },
        app: {
          orderpolicyrequester: '190101',
          orderSystem: 'bibliotekdk'
        },
        attributes: {
          uniqueId: {
            name: 'bruger ID',
            description: 'Unikt bruger ID, som ikke er personhenførbar'
          },
          municipality: {
            name: 'Kommunenummer',
            description: '3 cifret kommunenummer'
          }
        },
        displayName: 'Bibliotekslogin',
        borchkServiceName: 'login.bib.dk',
        identityProviders: ['nemlogin', 'borchk', 'unilogin', 'wayf']
      }
    }
  }
};

module.exports = config;
