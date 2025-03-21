import type {
  APIGatewayProxyEventBase,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand, PutCommandInput, PutCommandOutput,
  // GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { addDays } from "date-fns";
import { customLog } from "@osotnikov/lambda-common";
import {UserDto} from "@osotnikov/lambda-common/src/UserDto";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>): Promise<APIGatewayProxyResult> => {
  const tomorrow = addDays(new Date(), 1);
  event.body;
  customLog(tomorrow);

  const client = new DynamoDBClient({ endpoint: "http://ddb:8000" });
  const dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);
  console.log('about to write data to dynamodb');

  const p: PutCommandOutput = await dynamo.send(
      new PutCommand({
        TableName: "Users",
        Item: {
          username: "usr1",
          password: "psw1",
        } as UserDto,
      } as PutCommandInput)
  );

  return {
    'statusCode': 200,
    'body': '' + JSON.stringify(p)
  } as APIGatewayProxyResult;
};
