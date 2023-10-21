import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./DynamodbClient.js";
import { v4 as uuid } from 'uuid';


exports.handler = async function ( event ) {
   console.log( 'request: ', JSON.stringify( event, undefined, 2 ) )

   try {
      switch ( event.httpMethod ) {
         case "GET":
            if ( event.queryStringParameters != null ) {
               body = await getBasketsByCategory( event );
            }
            else if ( event.pathParameters != null ) {
               body = await getBasket( event.pathParameters.id );
            } else {
               body = await getAllBaskets();
            }
            break;
         case "POST":
            const Basket = JSON.parse( event.body );
            body = await createBasket( Basket );
            break;
         case "DELETE":
            body = await deleteBasket( event.pathParameters.id );
            break;
         case "PUT":
            body = await updateBasket( event );
            break;
         default:
            throw new Error( `Unsupported method "${event.httpMethod}"` );
      }

      return {
         statusCode: 200,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify( {
            message: `Successfully processed ${event.httpMethod} request`,
            body: body
         } )
      }

   } catch ( error ) {
      console.log( error )
      return {
         statusCode: 500,
         body: JSON.stringify( {
            message: "Failed to Perform Operation",
            errorMessenge: error.message,
            errorStack: error.stack
         } )
      }
   }
}


const getBasket = async ( BasketId ) => {
   console.log( "getBasket", BasketId )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( {
            id: BasketId
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

const getAllBaskets = async () => {
   console.log( 'Get all Baskets' )
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
const createBasket = async ( Basket ) => {
   console.log( 'Create Basket', Basket )
   try {
      const BasketId = uuid();
      Basket.id = BasketId;
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Item: marshall( Basket )
      }
      const response = await ddbClient.send( new PutItemCommand( params ) )
      console.log( "Success", response.Item )
      return unmarshall( response.Item )
   } catch ( error ) {
      console.log( error )
      throw error
   }
}

const deleteBasket = async ( BasketId ) => {
   console.log( 'Delete Basket', BasketId )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( {
            id: BasketId
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

const updateBasket = async ( event ) => {
   console.log( `updateBasket function. event : "${event}"` );
   try {
      const requestBody = JSON.parse( event.body );
      const objKeys = Object.keys( requestBody );
      console.log( `updateBasket function. requestBody : "${requestBody}", objKeys: "${objKeys}"` );

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

const getBasketsByCategory = async ( event ) => {
   console.log( "getBasketsByCategory" );
   try {
      // GET Basket/1234?category=Phone
      const BasketId = event.pathParameters.id;
      const category = event.queryStringParameters.category;

      const params = {
         KeyConditionExpression: "id = :BasketId",
         FilterExpression: "contains (category, :category)",
         ExpressionAttributeValues: {
            ":BasketId": { S: BasketId },
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