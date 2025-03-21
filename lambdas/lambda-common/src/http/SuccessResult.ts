import type {APIGatewayProxyResult} from "aws-lambda";

export class SuccessResult implements APIGatewayProxyResult {
    body: string = '';
    statusCode: number;

    constructor(body?: string) {
        this.statusCode = 200;
        if(body) {
            console.log(`response 200 with body: ${body}`)
            this.body = body;
        }
    }

}