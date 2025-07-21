# AquosControlRest

AquosをコントロールするHTTP API

# 準備

## 必要なパッケージのインストール
### コマンド例
```shell
sudo apt install zlib1g-dev libjpeg-dev libjpeg-dev python3-dev
``` 

## node.jsのインストール
1. ~/home/.local/ を作成し移動
2. https://nodejs.org/ja/download から適切なビルド済みバイナリをDLし展開
3. ~/home/.local/bin/にnodeなどのシンボリックリンクを作成
4. ~/home/.local/bin/にPATHを通す

### コマンド例
```shell
cd
mkdir .local
cd .local
wget https://nodejs.org/dist/v22.17.1/node-v22.17.1-linux-armv7l.tar.xz
tar Jxfv node-v22.17.1-linux-armv7l.tar.xz.tar.xz
mkdir bin
cd bin
ln -s ../node-v22.17.1-linux-armv7l/bin/node ./
ln -s ../node-v22.17.1-linux-armv7l/bin/npm ./
ln -s ../node-v22.17.1-linux-armv7l/bin/npx ./
ln -s ../node-v22.17.1-linux-armv7l/bin/corepack ./
vi ~/.bashrc
# 下記を追記
export PATH="$HOME/.local/bin:$PATH"
```

## npm install
1. AquosControlRestのディレクトリでnpm installを実行

### コマンド例
```shell
cd AquosControlRest
npm install
```

## サービス設定
1. etc/aquos_control_rest.service を /etc/systemd/system/ にコピー
2. systemdをリロードして読み込む
3. aquos_control_rest.serviceを有効化

### コマンド例
```shell
cd AquosControlRest
sudo cp etc/aquos_control_rest.service /etc/systemd/system/
sudo systemd daemon-reload
sudo systemd enable aquos_control_rest.service
```

## sshポートフォワード
1. ssh_forward/.env_sampleを.envにコピーし編集
2. ssh_port_forward.shを実行

### コマンド例
```shell
cd AquosControlRest/ssh_forward
cp .env_sample .env
vi .env
# TARGET_HOSTとTARGET_PORTを編集
./ssh_port_forward.sh
```

## sshポートフォワードの自動起動
1. cronに下記を記載
```
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
@reboot                  /home/pi/AquodControlRest/ssh_forward/onBoot.sh > /home/pi/AquodControlRest/ssh_forward/onBoot.log 2>&1
```
