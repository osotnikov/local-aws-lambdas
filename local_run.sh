#!/bin/bash

cd lambdas
yarn install
yarn run build
yarn run layer

cd ../local-test-infra
yarn install
yarn run build
yarn run synth
yarn run init