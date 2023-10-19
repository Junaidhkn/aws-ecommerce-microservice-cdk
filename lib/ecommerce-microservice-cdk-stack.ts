import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { EcomDatabase } from './database';
import { EcomMicroservices } from './microservice';

export class EcommerceMicroserviceCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const database = new EcomDatabase(this, 'ecommerceDatabase');
		const microservice = new EcomMicroservices(this, 'ecommerceMicroservice', {
			productTable: database.productTable,
		});

		const apiGateWay = new LambdaRestApi(this, 'productAPI', {
			restApiName: 'Product Service',
			handler: productFunction,
			proxy: false,
		});

		const product = apiGateWay.root.addResource('product'); // /product
		product.addMethod('GET');
		product.addMethod('POST');

		const singleProduct = product.addResource('{id}'); // /product/{id}

		singleProduct.addMethod('GET');
		singleProduct.addMethod('PUT');
		singleProduct.addMethod('DELETE');
	}
}
