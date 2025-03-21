import type {APIGatewayProxyResult} from "aws-lambda";

export class ClientErrorResult implements APIGatewayProxyResult {
    body: string;
    statusCode: number;

    constructor(errorMessage: string) {
        if(!errorMessage) {
            this.body = `Invalid request body`;
        } else {
            this.body = errorMessage;
        }
        this.statusCode = 400;
        console.error(this.body)
    }

}