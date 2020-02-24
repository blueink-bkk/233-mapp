module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: 'ultimheat.com',
      username: 'dkz',
    }
  },

  app: {
    // TODO: change app name and path
    name: '233-map',
    path: '/home/dkz/2020/233-mapp',

    volumes: {
       // passed as '-v /host/path:/container/path' to the docker run command
//       '/home/dkz/museum-pub': '/home/dkz/museum-pub',
//       '/home/dkz/ultimheat.com/museum':'/home/dkz/ultimheat.com/museum'
//       '/home/dkz/museum-assets':'/home/dkz/museum-assets'
     },


    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
//      ROOT_URL: 'http://ultimheat.com/dkz-jou',
      ROOT_URL: 'http://museum2.ultimheat.com',
//      ROOT_URL: 'http://ultimheat.com/',
      PORT: 32042
//      MONGO_URL: 'mongodb://localhost/meteor',
    },

    // ssl: { // (optional)
    //   // Enables let's encrypt (optional)
    //   autogenerate: {
    //     email: 'email.address@domain.com',
    //     // comma separated list of domains
    //     domains: 'website.com,www.website.com'
    //   }
    // },

    docker: {
      // change to 'kadirahq/meteord' if your app is using Meteor 1.3 or older
      image: 'abernix/meteord:node-12.16.1-base'
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

/*
  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  }
  */
};
