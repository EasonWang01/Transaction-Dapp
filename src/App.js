import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText, ListSubheader } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import { ExpandLess, ExpandMore, MoveToInbox as InboxIcon, SwapHoriz, Send } from 'material-ui-icons';
import { Button, Icon, TextField, Input, InputAdornment } from 'material-ui';
import { Modal } from 'react-pure-css-modal';

const web3 = new Web3();
window.web3 = web3
const eth = web3.eth;

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 760,
    margin: '0 auto',
  },
});

class App extends Component {

  constructor() {
    super();
    this.state = {
      accounts: '',
      blockHeight: '',
      blocks: [],
      currentAddress: '',
      accountTransactions: []
    }
  }

  componentWillMount() {
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')); //指定為RPC server的位置
    this.setState({ accounts: web3.eth.accounts });
    // 目前區塊高度
    let blockHeight = web3.eth.blockNumber;
    this.setState({ blockHeight });
    // 所有區塊資料
    let blocks = []
    for (let i = 0; i <= blockHeight; i++) {
      blocks.push(eth.getBlock(i, true));
    }
    this.setState({ blocks });
  }

  searchTransactionBtn() {
    document.getElementById('searchModal').click();
    this.setState({ searchModal: true })
    this.getTransactions(this.state.currentAddress)
  }

  submitTransaction() {
    this.setState({ sending: true });
    try {
      if (!this.state.senderAddress || !this.state.receiverAddress || !this.state.sendAmount) {
        alert('請輸入完再按確認。');
        window.location.reload();
        return
      }
      let transaction = {
        from: this.state.senderAddress,
        to: this.state.receiverAddress,
        value: web3.toWei(this.state.sendAmount, "ether"),
        gas: 21000
      };
      if (!web3.isAddress(this.state.senderAddress)
        || !web3.isAddress(this.state.receiverAddress)) {
        alert("地址格式不正確");
        window.location.reload();
        return
      }
      // 解鎖發送交易的帳號
      web3.personal.unlockAccount(this.state.senderAddress); // 如有設帳號密碼須於第二個參數輸入
      // 發送交易
      eth.sendTransaction(transaction, function (err, result) {
        if (err) {
          alert(err);
          window.location.reload();
          return
        }
        alert(`交易成功，${result}`);
        window.location.reload();
      })
    } catch (err) {
      alert(err)
      window.location.reload();
    }
  }

  // 讀出特定地址之所有交易
  getTransactions(address) {
    let accountTransactions = [];
    this.state.blocks.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.from === address || transaction.to === address) {
          accountTransactions.push(transaction);
        }
      })
    })
    this.setState({ currentAddress: address })
    this.setState({ accountTransactions })
    return accountTransactions
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to My Dapp</h2>
        </div>

        <br />查詢帳號交易紀錄 : <input onChange={(e) => this.setState({ currentAddress: e.target.value.trim() })} />
        <button onClick={() => this.searchTransactionBtn()}>查詢</button>

        <div className="App-intro">
          <br />
          {this.state.accounts.map((i, idx) => {
            let balance = web3.fromWei(web3.eth.getBalance(i)).toString();
            return (
              <div key={idx}>
                <br />
                <span>帳號{idx}: {i}，餘額: {balance.slice(0, 5)}{balance.indexOf('e') !== -1 ? 'e' : ''} </span>
                <span>( Ether )</span>
              </div>
            )
          }
          )}
        </div>

        <Modal id="searchModal" onClose={() => { this.setState({ searchModal: false }) }}>
          {this.state.accountTransactions.length > 0
            ? <List className={classes.root}>
              {this.state.accountTransactions.map((d, idx) => (
                <div>
                  <ListItem button onClick={() => this.setState({ [`open${idx}`]: !this.state[`open${idx}`] })}>
                    <ListItemIcon>
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText inset primary={d.hash} />
                    {this.state[`open${idx}`] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse component="li" in={this.state[`open${idx}`]} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      <ListItem>
                        <ListItemIcon>
                          <SwapHoriz />
                        </ListItemIcon>
                        <ListItemText inset primary={`From: ${d.from}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText inset primary={`To: ${d.to}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText inset primary={`Gas Limit: ${d.gas}`} />
                        <ListItemText inset primary={`Gas Price: ${d.gasPrice}`} />
                        <ListItemText inset primary={`At Block: ${d.blockNumber}`} />
                        <ListItemText inset primary={`Value: ${d.value.toString()}`} />
                      </ListItem>
                    </List>
                  </Collapse>
                </div>
              ))}
            </List>
            : ''}
        </Modal>

        <Modal id="send_modal" onClose={() => { this.setState({ sendModal: false }) }}>
          <div>
            <TextField
              id="send_from"
              label="發送人"
              placeholder="帳號"
              margin="normal"
              onChange={(e) => this.setState({ senderAddress: e.target.value })}
            />
            <br />
            <TextField
              id="send_from"
              label="接收人"
              placeholder="帳號"
              margin="normal"
              onChange={(e) => this.setState({ receiverAddress: e.target.value })}
            />
            <br />
            <br />
            <Input
              type="number"
              id="adornment-amount"
              value={this.state.amount}
              onChange={(e) => this.setState({ sendAmount: e.target.value })}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
            <br />
            <br /><br />
            <Button onClick={() => this.submitTransaction()} raised color="default">
              <Send />
              {this.state.sending ? '請稍等...' : '發送'}
            </Button>

          </div>
        </Modal>

        {
          this.state.sendModal || this.state.searchModal
            ?
            ''
            :
            <div style={{ marginTop: '50px' }}>
              <Button onClick={() => {
                this.setState({ sendModal: true })
                document.getElementById('send_modal').click();
              }} raised color="primary">
                <SwapHoriz />發送交易
             </Button>
            </div>
        }
      </div >
    );
  }
}

export default withStyles(styles)(App);

