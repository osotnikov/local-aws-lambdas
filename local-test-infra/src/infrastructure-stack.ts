import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from "path";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {CfnParameter} from "aws-cdk-lib";

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const dependenciesLayer = new LayerVersion(this, "DependenciesLayer", {
            code: Code.fromAsset("../lambdas/lambda-layer"),
            compatibleRuntimes: [Runtime.NODEJS_20_X]
        });

        const lambdaAppDir = path.resolve(__dirname, '../../lambdas')
        const testDynamoLambda: nodeLambda.NodejsFunction =
            new nodeLambda.NodejsFunction(this, 'TestDynamoLambda', {
                functionName: `testDynamoLambda`,
                runtime: lambda.Runtime.NODEJS_20_X,
                layers: [dependenciesLayer],
                depsLockFilePath: path.join(lambdaAppDir, 'yarn.lock'),
                entry: path.join(lambdaAppDir, 'testDynamoLambda/bin/testDynamoLambda.js'),
                memorySize: 1024,
                handler: 'handler',
                environment: {
                    LOG_LEVEL: 'DEBUG',
                },
            });

        const cognitoClientId = new CfnParameter(this, "cognitoClientId", {
            type: "String",
            description: "cognito client id."});
        const userPoolId = new CfnParameter(this, "userPoolId", {
            type: "String",
            description: "user pool id."});

        const signUpLambda: nodeLambda.NodejsFunction =
            new nodeLambda.NodejsFunction(this, 'SignUpLambda', {
                functionName: `signUpLambda`,
                runtime: lambda.Runtime.NODEJS_20_X,
                layers: [dependenciesLayer],
                depsLockFilePath: path.join(lambdaAppDir, 'yarn.lock'),
                entry: path.join(lambdaAppDir, 'signUpLambda/bin/signUpLambda.js'),
                memorySize: 1024,
                handler: 'signUpLambda',
                environment: {
                    LOG_LEVEL: 'DEBUG',
                    COGNITO_CLIENT_ID: cognitoClientId.valueAsString,
                    USER_POOL_ID: userPoolId.valueAsString
                },
            });

        const signInLambda: nodeLambda.NodejsFunction =
            new nodeLambda.NodejsFunction(this, 'SignInLambda', {
                functionName: `signInLambda`,
                runtime: lambda.Runtime.NODEJS_20_X,
                layers: [dependenciesLayer],
                depsLockFilePath: path.join(lambdaAppDir, 'yarn.lock'),
                entry: path.join(lambdaAppDir, 'signInLambda/bin/signInLambda.js'),
                memorySize: 1024,
                handler: 'signInLambda',
                environment: {
                    LOG_LEVEL: 'DEBUG',
                    COGNITO_CLIENT_ID: cognitoClientId.valueAsString,
                    USER_POOL_ID: userPoolId.valueAsString
                },
            });

        const api: apigw.RestApi = new apigw.RestApi(this, 'Api', {
            description: `main gateway`,
            restApiName: `apigw`,
            deploy: true,
            deployOptions: {
                stageName: 'api',
                dataTraceEnabled: true,
                loggingLevel: apigw.MethodLoggingLevel.INFO
            },
        });

        const apiRoot: apigw.Resource = api.root.addResource('v1');
        const testDynamoResource: apigw.Resource = apiRoot.addResource('testDynamoLambda');
        testDynamoResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(testDynamoLambda, {
                proxy: true,
            })
        );
        const signUpResource: apigw.Resource = apiRoot.addResource('signUpLambda');
        signUpResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(signUpLambda, {
                proxy: true,
            })
        );
        const signInResource: apigw.Resource = apiRoot.addResource('signInLambda');
        signInResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(signInLambda, {
                proxy: true,
            })
        );

        // dynamodb
        new dynamodb.Table(this, 'Table', {
            partitionKey: {name: 'username', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
    }
}
