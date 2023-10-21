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

		this.createProductApi(props.productMicroservice);
		this.createBasketApi(props.basketMicroservice);

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

	private createProductApi(productMicroservice: NodejsFunction) {
		const apiGateWay = new LambdaRestApi(this, 'productAPI', {
			restApiName: 'Product Service',
			handler: productMicroservice,
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

	private createBasketApi(basketMicroservice: NodejsFunction) {
		const apiGateWay = new LambdaRestApi(this, 'basketAPI', {
			restApiName: 'Basket Service',
			handler: basketMicroservice,
			proxy: false,
		});

		const basket = apiGateWay.root.addResource('basket'); // /basket
		basket.addMethod('GET');
		basket.addMethod('POST');

		const singleBasket = basket.addResource('{userName}'); // /basket/{userName}

		singleBasket.addMethod('GET');
		singleBasket.addMethod('PUT');
		singleBasket.addMethod('DELETE');

		const basketCheckout = basket.addResource('checkout'); // /basket/checkout
		basketCheckout.addMethod('POST');
	}
}
