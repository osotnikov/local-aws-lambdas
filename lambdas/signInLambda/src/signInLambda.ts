import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  Handler
} from "aws-lambda";

import {
  CognitoIdentityProviderClient, CognitoIdentityProviderClientConfig,
  InitiateAuthCommand, InitiateAuthCommandInput, AuthFlowType,
  InitiateAuthCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import {customLog} from "@osotnikov/lambda-common/src";
import {UserDto} from "@osotnikov/lambda-common/src/UserDto";
import {ClientErrorResult} from "@osotnikov/lambda-common/src/http/ClientErrorResult";
import {SuccessResult} from "@osotnikov/lambda-common/src/http/SuccessResult";

export const signInLambda: Handler = async (event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>) => {
  // print lambda process environment variables
  console.log(`COGNITO_CLIENT_ID: ${process.env.COGNITO_CLIENT_ID}`);
  customLog(`USER_POOL_ID: ${process.env.USER_POOL_ID}`);

  if (!event.body) {
    return new ClientErrorResult(`received empty request body, exiting`);
  }
  console.log(`received body: ${event.body}`)
  const userDto: UserDto = JSON.parse(event.body);
  // sign the user up
  const initiateAuthCommand: InitiateAuthCommand = createInitiateAuthCommand(userDto);
  const cognitoIdentityProviderClient: CognitoIdentityProviderClient = getCognitoIdentityProviderClient();
  const commandOutput: InitiateAuthCommandOutput = await cognitoIdentityProviderClient.send(initiateAuthCommand);
  return new SuccessResult(JSON.stringify(commandOutput));
};

function getCognitoIdentityProviderClient() {
  console.log(`region: ${process.env.AWS_REGION}`)
  const cogIdpClInp: CognitoIdentityProviderClientConfig = {
    region: process.env.AWS_REGION,
    endpoint: "http://cog:9229/",
  } as CognitoIdentityProviderClientConfig;
  return new CognitoIdentityProviderClient(cogIdpClInp);
}

function createInitiateAuthCommand(userDto: UserDto): InitiateAuthCommand {
  const initAuthCmdInput: InitiateAuthCommandInput = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: userDto.username,
      PASSWORD: userDto.password,
    }
  } as InitiateAuthCommandInput;
  const initAuthCommand = new InitiateAuthCommand(initAuthCmdInput);
  return initAuthCommand;
}
