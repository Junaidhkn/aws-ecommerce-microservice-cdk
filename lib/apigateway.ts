import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

interface EcomApiGatewayProps {
	productMicroservice: NodejsFunction;
	basketMicroservice: NodejsFunction;
}

export class EcomApiGateway extends Construct {
	constructor(scope: Construct, id: string, props: EcomApiGatewayProps) {
		super(scope, id);
		const apiGateWay = new LambdaRestApi(this, 'productAPI', {
			restApiName: 'Product Service',
			handler: props.productMicroservice,
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
