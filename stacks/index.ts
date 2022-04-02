import * as sst from "@serverless-stack/resources";
import TableStack from "./TableStack";
import WsStack from "./WsStack";
export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  const tableStack = new TableStack(app, "wsConnectionsTable");
  new WsStack(app, "wsapi", {
    table: tableStack.table,
  });
}
