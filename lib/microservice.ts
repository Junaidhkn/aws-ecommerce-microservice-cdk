import {
	NodejsFunction,
	NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';

interface EcomMicroservicesProps {
	productTable: TableV2;
	basketTable: TableV2;
}

export class EcomMicroservices extends Construct {
	public readonly productMicroservice: NodejsFunction;
	public readonly basketMicroservice: NodejsFunction;

	constructor(scope: Construct, id: string, props: EcomMicroservicesProps) {
		super(scope, id);

		this.productMicroservice = this.createProductMicroservice(
			props.productTable,
		);
		this.basketMicroservice = this.createBasketMicroservice(props.basketTable);
	}

	private createProductMicroservice(productTable: TableV2): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				// Generally @aws-sdk is for node version before node 16
				externalModules: ['aws-sdk'],
			},
			environment: {
				PRIMARY_KEY: 'id',
				DYNAMODB_TABLE_NAME: productTable.tableName,
			},
			runtime: Runtime.NODEJS_18_X,
		};

		const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
			entry: join(__dirname, '../src/product/index.js'),
			...nodeJsFunctionProps,
		});
		productTable.grantReadWriteData(productFunction);

		return productFunction;
	}

	private createBasketMicroservice(basketTable: TableV2): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				// Generally @aws-sdk is for node version before node 16
				externalModules: ['aws-sdk'],
			},
			environment: {
				PRIMARY_KEY: 'id',
				DYNAMODB_TABLE_NAME: basketTable.tableName,
			},
			runtime: Runtime.NODEJS_18_X,
		};

		const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
			entry: join(__dirname, '../src/product/index.js'),
			...nodeJsFunctionProps,
		});
		basketTable.grantReadWriteData(basketFunction);

		return basketFunction;
	}
}
