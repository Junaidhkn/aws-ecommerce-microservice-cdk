import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
	NodejsFunction,
	NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class EcommerceMicroserviceCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const productTable = new TableV2(this, 'product', {
			partitionKey: { name: 'id', type: AttributeType.STRING },
			tableName: 'product',
			removalPolicy: RemovalPolicy.DESTROY,
			billing: Billing.onDemand(),
		});

		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ['aws-sdk'],
			},
			environment: {
				PRIMARY_KEY: 'id',
				DYNAMODB_TABLE_NAME: productTable.tableName,
			},
			runtime: Runtime.NODEJS_18_X,
		};

		const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
			entry: join(__dirname, '/../src/product/index.js'),
			...nodeJsFunctionProps,
		});

		productTable.grantReadWriteData(productFunction);

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
