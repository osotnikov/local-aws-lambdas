#!/usr/bin/env node
import { InfrastructureStack } from "./infrastructure-stack";
import { App } from "aws-cdk-lib";

const app = new App();

new InfrastructureStack(app, "YarnWorkspaceLambdaLayer");
