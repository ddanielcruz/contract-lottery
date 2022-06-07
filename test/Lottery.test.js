const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const { interface, bytecode } = require('../compile')

const web3 = new Web3(ganache.provider())
let lottery
let accounts

beforeEach(async () => {
  accounts = await web3.eth.getAccounts()
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address)
  })

  it('sets manager as contract creator', async () => {
    const manager = await lottery.methods.manager().call()
    assert.equal(manager, accounts[0])
  })

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether')
    })

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] })
    assert.equal(players.length, 1)
    assert.equal(players[0], accounts[1])
  })

  it('allows multiple accounts to enter', async () => {
    for (let idx = 0; idx < 2; idx++) {
      await lottery.methods.enter().send({
        from: accounts[idx + 1],
        value: web3.utils.toWei('0.01', 'ether')
      })
    }

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] })
    assert.equal(players.length, 2)
    assert.equal(players[0], accounts[1])
    assert.equal(players[1], accounts[2])
  })

  it('requires a minimum amount of ether to enter', async () => {
    await assert.rejects(
      lottery.methods.enter().send({
        from: accounts[1],
        value: 0
      })
    )
  })

  it('only manager can call pickWinner', async () => {
    await assert.rejects(
      lottery.methods.pickWinner().send({
        from: accounts[1]
      })
    )
  })

  it('sends money to the winner', async () => {
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('1', 'ether') })
    const initialBalance = await web3.eth.getBalance(accounts[1])
    await lottery.methods.pickWinner().send({ from: accounts[0] })
    const finalBalance = await web3.eth.getBalance(accounts[1])
    const difference = finalBalance - initialBalance
    assert(difference > web3.utils.toWei('0.9', 'ether'))
  })
})
