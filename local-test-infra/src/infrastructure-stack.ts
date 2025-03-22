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
        // Point to the folder which has to contain the lambda layer contents i.e. the hoisted
        // node_modules folder created by yarn workspaces (which contains all the dependencies of
        // all the lambdas) under the nodejs folder i.e. lambda-layer/nodejs/node_modules.
        const dependenciesLayer = new LayerVersion(this, "DependenciesLayer", {
            code: Code.fromAsset("../lambdas/lambda-layer"),
            compatibleRuntimes: [Runtime.NODEJS_20_X]
        });
        // Create cloudformation parameters for the cognito client id and user pool id.
        // We need these, since we cannot create the cognito user pool in this cdk code,
        // since we have to create the emulated version outside as a docker container.
        // Therefore, we can only run this cdk script after the container is up, and we have
        // these values, which we can now copy to the corresponding lambda runtime environment
        // variables. Note that, the lambda runtime variables are set at deployment and cannot
        // be changed at runtime.
        const cognitoClientId = new CfnParameter(this, "cognitoClientId", {
            type: "String",
            description: "cognito client id."});
        const userPoolId = new CfnParameter(this, "userPoolId", {
            type: "String",
            description: "user pool id."});

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
                    LOCAL_TESTING: 'true'
                },
            });
        const testDynamoResource: apigw.Resource = apiRoot.addResource('testDynamoLambda');
        testDynamoResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(testDynamoLambda, {
                proxy: true,
            })
        );

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
                    // lambda runtime variables
                    LOG_LEVEL: 'DEBUG',
                    LOCAL_TESTING: 'true',
                    COGNITO_CLIENT_ID: cognitoClientId.valueAsString,
                    USER_POOL_ID: userPoolId.valueAsString
                },
            });
        const signUpResource: apigw.Resource = apiRoot.addResource('signUpLambda');
        signUpResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(signUpLambda, {
                proxy: true,
            })
        );

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
                    // lambda runtime variables
                    LOG_LEVEL: 'DEBUG',
                    LOCAL_TESTING: 'true',
                    COGNITO_CLIENT_ID: cognitoClientId.valueAsString,
                    USER_POOL_ID: userPoolId.valueAsString
                },
            });
        const signInResource: apigw.Resource = apiRoot.addResource('signInLambda');
        signInResource.addMethod(
            'POST',
            new apigw.LambdaIntegration(signInLambda, {
                proxy: true,
            })
        );
    }
}
