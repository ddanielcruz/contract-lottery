require('dotenv/config')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const { interface, bytecode } = require('./compile')

const provider = new HDWalletProvider(
  process.env.ACCOUNT_SECRET,
  'https://rinkeby.infura.io/v3/0df7c06aaaaf494fb1c1f9fb3ff308ff'
)
const web3 = new Web3(provider)

async function deploy() {
  const [, account] = await web3.eth.getAccounts()
  console.log('Attempting to deploy from account', account)

  const contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: account })

  console.log('Contract deployed to', contract.options.address)
  provider.engine.stop()
}

deploy()
