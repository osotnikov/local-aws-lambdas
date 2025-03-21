#!/bin/sh

export DOCKER_NET=lambda-net
# spin up dynamoDB
docker run -d --rm --name ddb --network $DOCKER_NET -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb

sleep 6

# aws-cli demands a value even when endpoint is supplied, can be any value
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=dummy2-region

echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_DEFAULT_REGION

# initialize tables
# create Users table
aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=username,AttributeType=S --key-schema AttributeName=username,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --region $AWS_DEFAULT_REGION | cut -c -80

# aws dynamodb list-tables --endpoint-url http://localhost:8000 --region dummy-region
# aws dynamodb scan --endpoint-url http://localhost:8000 --table-name Users --region dummy-region

# start cognito

docker run -d --rm --name cog --network $DOCKER_NET --publish 9229:9229 --volume $(pwd)/.cognito:/app/.cognito jagregory/cognito-local:latest

sleep 6
 # There's no way to create user pool with custom endpoint from cdk AFAIK
export USER_POOL_ID=`aws --endpoint http://localhost:9229 cognito-idp create-user-pool --pool-name usrp | jq -r '.UserPool.Id'`
echo USER_POOL_ID is $USER_POOL_ID
# only password authentication user pool clients supported by jagregory/cognito-local
export USER_POOL_CLIENT_ID=`aws --endpoint http://localhost:9229 cognito-idp create-user-pool-client --user-pool-id $USER_POOL_ID --client-name usrpc | jq -r '.UserPoolClient.ClientId'`
echo USER_POOL_CLIENT_ID is $USER_POOL_CLIENT_ID

# start lambdas
sam local start-api --debug --docker-network $DOCKER_NET -t ./cdk.out/YarnWorkspaceLambdaLayer.template.json --parameter-overrides ParameterKey=userPoolId,ParameterValue="$USER_POOL_ID" ParameterKey=cognitoClientId,ParameterValue="$USER_POOL_CLIENT_ID"
