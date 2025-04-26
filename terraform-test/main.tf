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
