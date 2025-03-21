#!/bin/sh

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=dummy-region

aws dynamodb create-table --table-name FooBars --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --region dummy-region

aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=username,AttributeType=S --key-schema AttributeName=username,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --region dummy-region

aws dynamodb list-tables --endpoint-url http://localhost:8000 --region dummy-region

aws dynamodb scan --endpoint-url http://localhost:8000 --table-name Users --region dummy-region