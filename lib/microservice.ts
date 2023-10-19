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
}

export class EcomMicroservices extends Construct {
	public readonly productMicroservice: NodejsFunction;

	constructor(scope: Construct, id: string, props: EcomMicroservicesProps) {
		super(scope, id);

		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ['aws-sdk'],
			},
			environment: {
				PRIMARY_KEY: 'id',
				DYNAMODB_TABLE_NAME: props.productTable.tableName,
			},
			runtime: Runtime.NODEJS_18_X,
		};

		const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
			entry: join(__dirname, '../src/product/index.js'),
			...nodeJsFunctionProps,
		});

		this.productMicroservice = productFunction;
		props.productTable.grantReadWriteData(productFunction);
	}
}
