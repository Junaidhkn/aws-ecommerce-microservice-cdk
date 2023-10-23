import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./DynamodbClient.js";
import { v4 as uuid } from 'uuid';


exports.handler = async function ( event ) {
   console.log( 'request: ', JSON.stringify( event, undefined, 2 ) )


   try {
      let body;
      switch ( event.httpMethod ) {
         case "GET":
            if ( event.queryStringParameters != null ) {
               body = await getBasket( event.pathParameters.userName );
            } else {
               body = await getAllBaskets();
            }
            break;
         case "POST":
            if ( event.path === '/basket/checkout' ) {
               body = await checkoutBasket( event )
            } else {
               const basket = JSON.parse( event.body );
               body = await createBasket( basket );
            }
            break;
         case "DELETE":
            body = await deleteBasket( event.pathParameters.userName );
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


const checkoutBasket = async ( event ) => {
   console.log( 'checkoutBasket', event )
   try {

   } catch ( error ) {
      console.log( error )
      throw error
   }
}

