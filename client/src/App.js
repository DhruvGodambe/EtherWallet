import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import Web3 from 'web3';
import "./App.css";

var Tx = require('ethereumjs-tx').Transaction

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    console.log(Tx)
    try {
      // Get network provider and web3 instance.
      const web3 = new Web3('http://127.0.0.1:7545');
      console.log(web3.utils)
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(this.state.change || 4).send({ from: accounts[1] });
    console.log("accounts: ", accounts)

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Get the value from the contract to prove it worked.
    const respons = await contract.methods.set(40).call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  createWallet = async () => {
    const newAddress = this.state.web3.eth.accounts.create();
    console.log(newAddress)
    this.setState({...this.state, account: newAddress})
  }

  transact = async () => {
    this.state.web3.eth.getTransactionCount('0x38C041B9560d9B7dC299583C25efBBE317e1475a')
    .then((count) => {
      const txObject = {
        nonce: this.state.web3.utils.toHex(count),
        to: '0x24a5D829Eb8fdfef3CEe953cA9310805571a7408',
        value: this.state.web3.utils.toHex(this.state.web3.utils.toWei(this.state.transact.value.toString(), 'ether')),
        gasLimit: this.state.web3.utils.toHex(21000),
        gasPrice: this.state.web3.utils.toHex(this.state.web3.utils.toWei('10', 'gwei')),
      }
      
      const tx = new Tx(txObject)
      var privateKey = Buffer.from('0635bdeac2b22da46e9887f60b0332b447cd0982abe5dc3796b9765785ad1ef6')
      console.log(privateKey)
      tx.sign(privateKey)

      const serializedTransaction = tx.serialize()
      const raw = '0x' + serializedTransaction.toString('hex')

      this.state.web3.eth.sendSignedTransaction(raw, (err, txHash) => {
        console.log('txHash: ', txHash)
      })
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Ethereum Wallet</h1>
        <div className='parent-container'>
          <h2>Create an Account</h2>
          <hr/>

          {this.state.account ? 
            <div>
              <p>your newly generated address: {this.state.account.address}</p>
              <p>your private key for this address: {this.state.account.privateKey}</p>
            </div>
            :
            <div>
              <button onClick={this.createWallet} className='container-button'>create</button>
              <p style={{color: '#555', fontSize: '17px'}}>It will generate a new address and a private key for your eth transactions</p>
            </div>
          }

          <h2>Send Ether</h2>
          <hr/>
          <div style={{margin: '10px 0'}}>
            <input
              placeholder='From'
              style={{fontSize: '20px', padding: '5px', minWidth: '435px', maxWidth: '600px'}}
              onChange={(e) => {
                this.setState({...this.state, transact: {...this.state.transact, from: e.target.value}})
              }}
              />
          </div>
          <div style={{margin: '10px 0'}}>
            <input
              placeholder='To'
              style={{fontSize: '20px', padding: '5px', minWidth: '435px', maxWidth: '600px'}}
              onChange={(e) => {
                this.setState({...this.state, transact: {...this.state.transact, to: e.target.value}})
              }}
              />
          </div>
          <div style={{margin: '10px 0'}}>
            <input
              placeholder='Amount of ether'
              style={{fontSize: '20px', padding: '5px', minWidth: '435px', maxWidth: '600px'}}
              onChange={(e) => {
                this.setState({...this.state, transact: {...this.state.transact, value: e.target.value}})
              }}
              />
          </div>
          <button onClick={this.transact} className='container-button'>send</button>
          <p style={{color: '#555', fontSize: '17px'}}>send ether to known addresses only!</p>
          {this.state.transaction ? <h1>transaction Successful</h1> : null}
        </div>
      </div>
    );
  }
}

export default App;
