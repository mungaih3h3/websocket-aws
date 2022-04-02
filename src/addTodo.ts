import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

const db = new AWS.DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandlerV2 = async (event) => {
  let connectionData;

  const tableName = process.env.TABLE_NAME;
  if (!tableName)
    throw new Error("TABLE_NAME not specified in process.env.TABLE_NAME");

  if (!event.body) throw new Error("Event body is missing");

  try {
    connectionData = await db
      .scan({
        TableName: tableName,
        ProjectionExpression: "connectionId",
      })
      .promise();
  } catch (e: any) {
    return { statusCode: 200, body: e.stack };
  }
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const postData = JSON.parse(event.body).data;

  const postCalls = (connectionData.Items ?? []).map(
    async ({ connectionId }) => {
      try {
        await apigwManagementApi
          .postToConnection({ ConnectionId: connectionId, Data: postData })
          .promise();
      } catch (e: any) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await db
            .delete({ TableName: tableName, Key: { connectionId } })
            .promise();
        } else {
          throw e;
        }
      }
    }
  );

  try {
    await Promise.all(postCalls);
  } catch (e: any) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: "Data sent!" };
};
