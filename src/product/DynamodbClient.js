import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


const dynamodbClient = new DynamoDBClient();
export { dynamodbClient };