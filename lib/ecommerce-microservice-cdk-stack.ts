import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class EcommerceMicroserviceCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const productTable = new TableV2(this, 'product', {
			partitionKey: { name: 'id', type: AttributeType.STRING },
			tableName: 'product',
			removalPolicy: RemovalPolicy.DESTROY,
			billing: Billing.onDemand(),
		});
	}
}
