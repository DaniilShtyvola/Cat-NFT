module.exports = {
  contracts_directory: "./contracts",
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
    },
    dashboard: {
    }
  },
  compilers: {
    solc: {
      version: "0.8.13",
    }
  },
  db: {
    enabled: false,
    host: "127.0.0.1",
  }
};
