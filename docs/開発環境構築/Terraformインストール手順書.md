以下では、**「The bucket does not allow ACLs」エラーを回避しつつ、TerraformでS3バケットにACLを設定する**ための手順書を改めて示します。

AWSでは**デフォルトでACLを無効化 (Object Ownership = BucketOwnerEnforced)** する挙動が強化され、  
その状態だと `aws_s3_bucket_acl` リソースで `ACL` を付与しようとするとエラーになります。

もし **ACLを明示的に設定する必要がない** 場合は、ACLリソース自体を削除し、S3バケットだけを作成すればエラーは発生しません。  
（バケットはデフォルトで「プライベート」扱いです。）  

ただし、**ACLを使用しなければならない** 場合は、**`aws_s3_bucket_ownership_controls` リソース** を追加し、`object_ownership` を `BucketOwnerPreferred` または `ObjectWriter` に設定する必要があります。こうすることで、バケットでACLが有効になり、`aws_s3_bucket_acl` リソースが利用可能となります。

---

# 目次

1. [IAMユーザー作成](#section1)  
2. [AWS CLIのインストール＆設定](#section2)  
3. [Terraformインストール](#section3)  
4. [TerraformでS3バケットを作成（ACL有効化）](#section4)  
5. [まとめ](#section5)

---

## <a name="section1">1. IAMユーザー作成</a>

1. **AWSマネジメントコンソール** → IAM → 「ユーザー (Users)」 → 「ユーザーを追加 (Add users)」  
2. ユーザー名、**Access key (プログラムによるアクセス)** を選択  
3. 権限（ポリシー）を付与 → 開発用なら `AdministratorAccess` でもOK  
4. 生成される **Access Key ID** / **Secret Access Key** を安全に保管  
   - シークレットアクセスキーはこのときのみ表示

---

## <a name="section2">2. AWS CLI のインストール＆設定</a>

### 2.1 インストール

- [AWS CLI公式ドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html) に従って **AWS CLI v2** をインストールします。  
- Macでは `.pkg` または ZIPインストーラ、Linux（WSL2など）では ZIPを展開して `./aws/install` する方法が公式推奨です。  
- `aws --version` で `aws-cli/2.x.x` が表示されれば成功。

### 2.2 認証情報の登録

以下を実行し、アクセスキーIDとシークレットアクセスキーを入力します。  
```bash
aws configure
```
```
AWS Access Key ID [None]: <アクセスキーID>
AWS Secret Access Key [None]: <シークレットアクセスキー>
Default region name [None]: ap-northeast-1
Default output format [None]: json
```
設定が完了すると `~/.aws/credentials` に認証情報が保存され、**Terraformも自動で参照** します。

---

## <a name="section3">3. Terraformインストール</a>

### 3.1 Mac (Homebrew例)

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform version
```

### 3.2 Linux（WSL2上のUbuntu例）

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository \
  "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
terraform version
```

---

## <a name="section4">4. TerraformでS3バケットを作成（ACL有効化）</a>

### 4.1 「ACLを使わずにprivateバケットを作るだけ」の場合

- S3バケットはデフォルトでプライベートです。  
- **ACLを特に変えない**のであれば、`aws_s3_bucket_acl` リソースは不要です。  
- 以下の `main.tf` で警告やエラーなく **privateバケット** が作れます。

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "example_bucket" {
  bucket = "my-terraform-unique-bucket-20230405"  # ユニークな名称に変更
}
```

#### コマンド

```bash
terraform init
terraform plan
terraform apply  # → yes
```
- これでバケットが作成され、デフォルトでprivateなアクセス権となります。

---

### 4.2 「明示的にACLを設定したい」場合

最新のS3はデフォルトで「Object Ownership = BucketOwnerEnforced」になっており、  
この設定下では**ACLが無効**になって `aws_s3_bucket_acl` がエラーを起こします。

そこで下記のように、**「Ownership Controls」を「ObjectWriter」または「BucketOwnerPreferred」** にしてACLを有効にします。  
そのうえで `aws_s3_bucket_acl` で `acl = "private"` を指定すれば、エラーなくACLを反映できます。

```hcl
# main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

# S3バケット本体
resource "aws_s3_bucket" "example_bucket" {
  bucket = "my-terraform-unique-bucket-20230405"  # ユニーク名に変更
}

# Bucket Ownership Controls: ACLを有効にするため、BucketOwnerEnforced以外に設定
resource "aws_s3_bucket_ownership_controls" "example_ownership" {
  bucket = aws_s3_bucket.example_bucket.id

  rule {
    # どちらかを指定
    # object_ownership = "ObjectWriter"
    object_ownership = "BucketOwnerPreferred"
  }
}

# バケットのACLを別リソースで設定
resource "aws_s3_bucket_acl" "example_bucket_acl" {
  bucket = aws_s3_bucket.example_bucket.id
  acl    = "private"
}
```

#### 主な設定値

- **object_ownership = "BucketOwnerPreferred"**  
  バケット所有者（BucketOwner）を常にオブジェクトの所有者にするが、ACLも使用可能にする。
- **object_ownership = "ObjectWriter"**  
  オブジェクトを書き込んだ人（Object Writer）を所有者にする。ACLは使用可能。
- **object_ownership = "BucketOwnerEnforced"**  
  ACLが完全に無効化される (デフォルト)。ACL操作はできず、エラー発生。

#### 実行コマンド

```bash
terraform init
terraform plan
terraform apply  # → yes
```

- これによりバケットが作成され、Ownership Controlsが「BucketOwnerPreferred (または ObjectWriter)」に設定され、  
  `aws_s3_bucket_acl` で指定したACL (`private`) が適用されます。

- 不要になったら  
  ```bash
  terraform destroy
  ```
  でリソースを削除できます。

---

## <a name="section5">5. まとめ</a>

1. **エラー原因**: デフォルトの「BucketOwnerEnforced」でACLが無効化されている状態で `aws_s3_bucket_acl` を設定しようとすると、  
   **「The bucket does not allow ACLs」** エラーが起こる。  

2. **解決策**:  
   - **ACLをそもそも使わない** → `aws_s3_bucket_acl` リソースを削除し、デフォルトのprivate設定で問題なし。  
   - **ACLを使いたい** → `aws_s3_bucket_ownership_controls` を追加し、`object_ownership = "BucketOwnerPreferred"` などACL使用可能な値へ設定する。

3. **Terraform + AWS CLI v2** の基本手順  
   - **IAMユーザー**（Access key）作成  
   - **AWS CLI v2** インストール → `aws configure`  
   - **Terraform** インストール → `terraform init → plan → apply`

このように、S3の新しいデフォルト仕様では**必要に応じてOwnership Controlsを調整**しないとACLが無効化される点に注意してください。  
以上の修正を反映すれば、**「AccessControlListNotSupported」エラー** や **Deprecated警告** を回避しつつ、TerraformによるS3バケットの構築が可能になります。
