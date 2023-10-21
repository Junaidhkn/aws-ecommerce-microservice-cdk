import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class EcomDatabase extends Construct {
	public readonly productTable: TableV2;
	public readonly basketTable: TableV2;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		const productTable = new TableV2(this, 'product', {
			partitionKey: { name: 'id', type: AttributeType.STRING },
			tableName: 'product',
			removalPolicy: RemovalPolicy.DESTROY,
			billing: Billing.onDemand(),
		});

		this.productTable = productTable;

		// Basket DynamoDb Table Creation
		// Basket : PK: username --items (SET-MAP Object)
		// Item1 : { quantity - color - price - productID - productName}
		// Item2 : { quantity - color - price - productID - productName}

		const basketTable = new TableV2(this, 'basket', {
			partitionKey: { name: 'userName', type: AttributeType.STRING },
			tableName: 'basket',
			removalPolicy: RemovalPolicy.DESTROY,
			billing: Billing.onDemand(),
		});

		this.basketTable = basketTable;
	}
}
