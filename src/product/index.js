import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./DynamodbClient.js";
import { v4 as uuid } from 'uuid';


exports.handler = async function ( event ) {
   console.log( 'request: ', JSON.stringify( event, undefined, 2 ) )


   switch ( event.httpMethod ) {
      case "GET":
         if ( event.pathParameters != null ) {
            body = await getProduct( event.pathParameters.id );
         } else {
            body = await getAllProducts();
         }
      case "POST":
         const product = JSON.parse( event.body );
         body = await createProduct( product );
         break;
      case "DELETE":
         body = await deleteProduct( event.pathParameters.id );
         break;
      case "PUT":
         body = await updateProduct( event );
         break;
      default:
         throw new Error( `Unsupported method "${event.httpMethod}"` );
   }



   return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: `Hello from product ! You have got a hit at ${event.path}/n`
   }
}


const getProduct = async ( productId ) => {
   console.log( "getProduct", productId )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( {
            id: productId
         } ),
      }
      const { Item } = await ddbClient.send( new GetItemCommand( params ) )
      console.log( "Success", Item )
      return ( Item ) ? unmarshall( Item ) : {}
   } catch ( error ) {
      console.log( error )
      throw error
   }

}

const getAllProducts = async () => {
   console.log( 'Get all products' )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
      };
      const { Items } = await ddbClient.send( new ScanCommand( params ) );
      console.log( Items )
      return ( Items ) ? Items.map( ( item ) => unmarshall( item ) ) : {};
   } catch ( error ) {
      console.log( error )
      throw error
   }
}
// If there is an error try parsing the event body in the try catch block rather than the switch case
const createProduct = async ( product ) => {
   console.log( 'Create product', product )
   try {
      const productId = uuid();
      product.id = productId;
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Item: marshall( product )
      }
      const response = await ddbClient.send( new PutItemCommand( params ) )
      console.log( "Success", response.Item )
      return unmarshall( response.Item )
   } catch ( error ) {
      console.log( error )
      throw error
   }
}

const deleteProduct = async ( productId ) => {
   console.log( 'Delete product', productId )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( {
            id: productId
         } ),
      }
      const response = await ddbClient.send( new DeleteItemCommand( params ) )
      console.log( "Success", response )
      return unmarshall( response )
   } catch ( error ) {
      console.log( error )
      throw error
   }
}

const updateProduct = async ( event ) => {
   console.log( `updateProduct function. event : "${event}"` );
   try {
      const requestBody = JSON.parse( event.body );
      const objKeys = Object.keys( requestBody );
      console.log( `updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"` );

      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( { id: event.pathParameters.id } ),
         UpdateExpression: `SET ${objKeys.map( ( _, index ) => `#key${index} = :value${index}` ).join( ", " )}`,
         ExpressionAttributeNames: objKeys.reduce( ( acc, key, index ) => ( {
            ...acc,
            [`#key${index}`]: key,
         } ), {} ),
         ExpressionAttributeValues: marshall( objKeys.reduce( ( acc, key, index ) => ( {
            ...acc,
            [`:value${index}`]: requestBody[key],
         } ), {} ) ),
      };

      const updateResult = await ddbClient.send( new UpdateItemCommand( params ) );

      console.log( updateResult );
      return updateResult;
   } catch ( e ) {
      console.error( e );
      throw e;
   }

}

const getProductsByCategory = async ( event ) => {
   console.log( "getProductsByCategory" );
   try {
      // GET product/1234?category=Phone
      const productId = event.pathParameters.id;
      const category = event.queryStringParameters.category;

      const params = {
         KeyConditionExpression: "id = :productId",
         FilterExpression: "contains (category, :category)",
         ExpressionAttributeValues: {
            ":productId": { S: productId },
            ":category": { S: category }
         },
         TableName: process.env.DYNAMODB_TABLE_NAME
      };

      const { Items } = await ddbClient.send( new QueryCommand( params ) );

      console.log( Items );
      return Items.map( ( item ) => unmarshall( item ) );
   } catch ( e ) {
      console.error( e );
      throw e;
   }
}