import * as sst from "@serverless-stack/resources";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Function } from "@serverless-stack/resources";
import { aws_dynamodb } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export default class WsStack extends sst.Stack {
  constructor(
    scope: sst.App,
    id: string,
    props: sst.StackProps & { table: aws_dynamodb.Table }
  ) {
    super(scope, id, props);
    const { table } = props;
    const connectHandler = new Function(this, "onConnect", {
      handler: "src/connectHandler.main",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const disconnectHandler = new Function(this, "onDisconnect", {
      handler: "src/disconnectHandler.main",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const addTodoHandler = new Function(this, "addTodo", {
      handler: "src/addTodo.main",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const websocketApi = new WebSocketApi(this, "wsapi", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "connectionIntegration",
          connectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "disconnectIntegration",
          disconnectHandler
        ),
      },
    });

    websocketApi.addRoute("addTodo", {
      integration: new WebSocketLambdaIntegration(
        "addTodoHandler",
        addTodoHandler
      ),
    });

    table.grantReadWriteData(connectHandler);

    table.grantFullAccess(addTodoHandler);
    table.grantReadWriteData(disconnectHandler);

    const apiStage = new WebSocketStage(this, "devStage", {
      webSocketApi: websocketApi,
      stageName: "dev",
      autoDeploy: true,
    });
    const connectionArns = this.formatArn({
      service: "execute-api",
      resourceName: `${apiStage.stageName}/POST/*`,
      resource: websocketApi.apiId,
    });

    addTodoHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ["execute-api:ManageConnections"],
        resources: [connectionArns],
      })
    );

    this.addOutputs({
      WebSocketEndpoint: websocketApi.apiEndpoint,
    });
  }
}
