# WebSocket API on aws with AWS CDK

Using aws apigatewayv2 websocket api paired with aws dynamodb to store the connection ids. Hooked to the websocket api are lambda integrations: connectHandler, disconnectHandler, addTodo

I used Serverless Stack for the live lambda functionality and AWS CDK to define the infrastructure
