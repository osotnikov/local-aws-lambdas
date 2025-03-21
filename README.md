# Yarn workspaces with Lambda Layer

[Yarn workspaces](https://yarnpkg.com/features/workspaces) hoists all node_modules dependencies to a shared folder

[Lambda layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) Dependencies do not need to be shipped with the Lambda deployment package, meaning smaller Lambdas and reduced invocation times.