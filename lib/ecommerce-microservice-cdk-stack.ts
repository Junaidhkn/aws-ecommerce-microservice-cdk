import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { EcomDatabase } from './database';
import { EcomMicroservices } from './microservice';
import { EcomApiGateway } from './apigateway';

export class EcommerceMicroserviceCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const database = new EcomDatabase(this, 'ecommerceDatabase');

		const microservices = new EcomMicroservices(this, 'ecommerceMicroservice', {
			productTable: database.productTable,
		});

		const apiGateWay = new EcomApiGateway(this, 'ecommerceApiGateway', {
			productMicroservice: microservices.productMicroservice,
		});
	}
}
