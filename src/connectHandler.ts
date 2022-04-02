import { APIGatewayProxyEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const db = new AWS.DynamoDB.DocumentClient();
export const main = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error("TABLE_NAME not specified in process.env.TABLE_NAME");
  }
  const params = {
    TableName: tableName,
    Item: {
      connectionId: event.requestContext.connectionId,
    },
  };
  try {
    await db.put(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      body: `Failed to connect: ${JSON.stringify(error)}`,
    };
  }
  return {
    statusCode: 200,
    body: `Connected!`,
  };
};
