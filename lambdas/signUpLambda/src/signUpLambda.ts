import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    Handler
} from "aws-lambda";

import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    AdminConfirmSignUpCommand,
    AdminConfirmSignUpCommandInput,
    SignUpCommandInput, CognitoIdentityProviderClientConfig,
    InitiateAuthCommand, InitiateAuthCommandInput, AuthFlowType
} from "@aws-sdk/client-cognito-identity-provider";
import {customLog} from "@osotnikov/lambda-common";
import {UserDto} from "@osotnikov/lambda-common/src/UserDto";
import {ClientErrorResult} from "@osotnikov/lambda-common/src/http/ClientErrorResult";
import {SuccessResult} from "@osotnikov/lambda-common/src/http/SuccessResult";

export const signUpLambda: Handler = async (event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>) => {
    // print lambda process environment variables
    console.log(`COGNITO_CLIENT_ID: ${process.env.COGNITO_CLIENT_ID}`);
    customLog(`USER_POOL_ID: ${process.env.USER_POOL_ID}`);

    if (!event.body) {
        return new ClientErrorResult(`received empty request body, exiting`);
    }
    console.log(`received body: ${event.body}`)
    const userDto: UserDto = JSON.parse(event.body);
    // sign the user up
    const signUpCommand: SignUpCommand = createSignUpCommand(userDto);
    const cognitoIdentityProviderClient = getCognitoIdentityProviderClient();
    const signUpResponse = cognitoIdentityProviderClient.send(signUpCommand);
    console.log(JSON.stringify(signUpResponse))
    // verify user sign up (admin operation)
    await verifyUserSignUp(userDto, cognitoIdentityProviderClient);

    return new SuccessResult();
};

function getCognitoIdentityProviderClient() {
    console.log(`region: ${process.env.AWS_REGION}`)
    const cogIdpClInp: CognitoIdentityProviderClientConfig = {
        region: process.env.AWS_REGION,
        endpoint: "http://cog:9229/",
    } as CognitoIdentityProviderClientConfig;
    return new CognitoIdentityProviderClient(cogIdpClInp);
}

function createSignUpCommand(userDto: UserDto): SignUpCommand {
    // sign up
    const signUpCommandInput: SignUpCommandInput = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: userDto.username,
        Password: userDto.password,
        // UserAttributes: [{ Name: "email", Value: "email@email.com" }],
    } as SignUpCommandInput;
    const signUpCommand = new SignUpCommand(signUpCommandInput);
    return signUpCommand;
}

async function verifyUserSignUp(userDto: UserDto, cognitoIdentityProviderClient: CognitoIdentityProviderClient) {
    const adminConfirmSignUpCommandInput: AdminConfirmSignUpCommandInput = { // AdminConfirmSignUpRequest
        UserPoolId: process.env.USER_POOL_ID, // required
        Username: userDto.username, // required
    } as AdminConfirmSignUpCommandInput;
    const command = new AdminConfirmSignUpCommand(adminConfirmSignUpCommandInput);
    const response = await cognitoIdentityProviderClient.send(command);
    console.log(JSON.stringify(response))
}
