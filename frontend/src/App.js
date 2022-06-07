import React from 'react'

import lottery from './lottery'

import './App.css'
import web3 from './web3'

class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '0.0001',
    message: ''
  }

  async componentDidMount() {
    const [manager, players, balance] = await Promise.all([
      lottery.methods.manager().call(),
      lottery.methods.getPlayers().call(),
      web3.eth.getBalance(lottery.options.address)
    ])

    this.setState({ manager, players, balance })
  }

  onSubmit = async (ev) => {
    ev.preventDefault()
    this.setState({ message: 'Waiting on transaction success...' })
    const [account] = await web3.eth.getAccounts()
    await lottery.methods.enter().send({
      from: account,
      value: web3.utils.toWei(this.state.value, 'ether')
    })
    this.setState({ message: 'You have been entered!' })
  }

  onClick = async () => {
    this.setState({ message: 'Waiting on transaction success...' })
    const [account] = await web3.eth.getAccounts()
    await lottery.methods.pickWinner().send({
      from: account
    })
    this.setState({ message: 'A winner has been picked!' })
  }

  render() {
    const { manager, players, balance, value, message } = this.state
    return (
      <main className="App">
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {manager}. There are currently {players.length} people
          entered, competing to win {web3.utils.fromWei(balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              type="text"
              onChange={(ev) => this.setState({ value: ev.target.value })}
              value={value}
              autoFocus
            />
          </div>
          <button type="submit">Enter</button>
        </form>

        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        {message && (
          <>
            <hr />
            <h1>{message}</h1>
          </>
        )}
      </main>
    )
  }
}
export default App
