import { GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./DynamodbClient.js";


exports.handler = async function ( event ) {
   console.log( 'request: ', JSON.stringify( event, undefined, 2 ) )


   switch ( event.httpMethod ) {
      case "GET":
         if ( event.pathParameters != null ) {
            body = await getProduct( event.pathParameters.id );
         } else {
            body = await getAllProducts();
         }
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