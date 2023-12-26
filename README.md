# EVM链通用打铭文脚本

本脚本适用于所有EVM链的批量打铭文，为了保护用户私钥，使用了命令行模式，所有配置文件独立于软件，由用户自行配置。

可以开多个终端同时运行多个操作账户，如下图：
![](https://live.staticflickr.com/65535/53421438579_b443e38552_o.png)


## 安装
请确保本地有`git`和`npm`或者`yarn`环境，运行：
```
git clone https://github.com/jackygu2006/mint_inscription.git
yarn install
yarn build
```

如果本机上没有`yarn`，参考文档`https://yarn.bootcss.com/docs/install/index.html#mac-stable`

## 查看参数配置
```
yarn start mint -h
```

参数如下：
```
Options:
  -V, --version                   output the version number
  -t --to <MintToAddress>         Mint target account
  -p --prikey <PrivateKey>        Private key of operator account
  -s --size <SizeOfMint>          Total mint times
  -g --gasprice <GasPriceLimit>   The highest gas price can accept
  -r --rpc <rpc>                  RPC
  -x --hex <HexString>            Hex string of inscription
  -c --chainid <ChainId>          Chain id
  -b --getblockkey <GetBlockKey>  GetBlock access token
  -h, --help                      display help for command
```


## 配置批处理脚本
因为上述参数比较多，为了方便起见，可以编辑一个批处理。在linux/mac电脑上，建立`.sh`可执行文件，在windows电脑上，建立`.bat`批处理文件。

## 注意
### 确保操作账户，也就是提供私钥的账户有资金。

### GetBlock access token
这里使用`GetBlock`服务来动态获取gas价格，需要`GetBlock`的`Access Token`，请自行获取，参考文档:https://getblock.io/docs/get-started/auth-with-access-token/

### 可能的错误
因为链的可扩容性限制，以及`RPC`的限制，批量打铭文很容易引起以下错误：
* replacement transaction underpriced
* Failed to check for transaction receipt
* Invalid JSON RPC response: {}
* You've exceeded the RPS limit available on the current plan

可以暂停片刻再尝试。

