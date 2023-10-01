#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcommerceMicroserviceCdkStack } from '../lib/ecommerce-microservice-cdk-stack';

const app = new cdk.App();
new EcommerceMicroserviceCdkStack(app, 'EcommerceMicroserviceCdkStack', {});
