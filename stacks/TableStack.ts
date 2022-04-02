import * as sst from "@serverless-stack/resources";
import { aws_dynamodb } from "aws-cdk-lib";

export default class MyStack extends sst.Stack {
  table: aws_dynamodb.Table;
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);
    this.table = new aws_dynamodb.Table(this, "wsconnections", {
      partitionKey: {
        name: "connectionId",
        type: aws_dynamodb.AttributeType.STRING,
      },
    });
  }
}
